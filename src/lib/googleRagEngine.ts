import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { GoogleAuth } from 'google-auth-library';
import {
  appendStudentBooking,
  findFreeSlots,
} from '@/lib/googleSheetsBooking';

/**
 * Global Google Drive (.docx / .xlsx) + Google AI Studio Vector RAG Engine
 * - Supports Google Drive API v3 (Service Account) with instant modifiedTime change detection
 * - Supports public Google Docs / Sheets / Drive links as zero-auth fallback
 * - Supports local .docx / .xlsx files in knowledge-base/ with mtimeMs live-reload
 * - Embeddings: gemini-embedding-001 (RETRIEVAL_DOCUMENT / RETRIEVAL_QUERY)
 * - Generation: gemini-3.5-flash-lite
 */

export type EmbeddingTaskType =
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY';

export interface KnowledgeChunk {
  id: string;
  source: string;
  title: string;
  heading: string;
  text: string;
  vector?: number[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  similarity: number;
  similarityPercent: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentSource {
  key: 'price' | 'faq' | 'schedule';
  title: string;
  type: 'docx' | 'xlsx';
  googleIdEnv: string;
  localFilename: string;
}

const DOCUMENT_SOURCES: DocumentSource[] = [
  {
    key: 'price',
    title: 'Прайс-лист',
    type: 'docx',
    googleIdEnv: 'GOOGLE_PRICE_DOC_ID',
    localFilename: '01_price_list.docx',
  },
  {
    key: 'faq',
    title: 'FAQ',
    type: 'docx',
    googleIdEnv: 'GOOGLE_FAQ_DOC_ID',
    localFilename: '02_faq.docx',
  },
  {
    key: 'schedule',
    title: 'График работы и контакты',
    type: 'xlsx',
    googleIdEnv: 'GOOGLE_SCHEDULE_XLSX_ID',
    localFilename: '03_schedule_and_contacts.xlsx',
  },
];

// In-memory embedding cache keyed by `${embeddingModel}:${taskType}:${text}`
const vectorCache = new Map<string, number[]>();

// Per-document cache keyed by doc.key, invalidated immediately when version/modifiedTime/hash changes
const docChunkCache = new Map<
  string,
  { version: string; chunks: KnowledgeChunk[] }
>();

let driveAuthClient: GoogleAuth | null = null;

function getConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY || '',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.5-flash-lite',
  };
}

function getServiceAccountAuth(): GoogleAuth | null {
  if (driveAuthClient) return driveAuthClient;

  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (jsonRaw) {
    const credentials = JSON.parse(jsonRaw);
    driveAuthClient = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return driveAuthClient;
  }

  if (clientEmail && privateKey) {
    driveAuthClient = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return driveAuthClient;
  }

  return null;
}

/**
 * 1. Vector Math: Cosine Similarity
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 2. Parse .docx Buffer into Semantic Chunks
 */
async function parseDocxBuffer(
  buffer: Buffer,
  doc: DocumentSource
): Promise<KnowledgeChunk[]> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.trim();
  if (!text) return [];

  // Split large docx text into logical chunks (~900–1400 chars) on paragraph boundaries
  const paragraphs = text
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: KnowledgeChunk[] = [];
  let currentBlock = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    if (currentBlock.length + para.length > 1200 && currentBlock.length > 0) {
      const heading = currentBlock.split('\n')[0].slice(0, 80);
      chunks.push({
        id: `${doc.key}#${chunkIndex++}`,
        source: doc.title,
        title: `${doc.title}: ${heading}`,
        heading,
        text: `[Документ: ${doc.title}]\n${currentBlock}`,
      });
      currentBlock = para;
    } else {
      currentBlock = currentBlock ? `${currentBlock}\n\n${para}` : para;
    }
  }

  if (currentBlock) {
    const heading = currentBlock.split('\n')[0].slice(0, 80);
    chunks.push({
      id: `${doc.key}#${chunkIndex++}`,
      source: doc.title,
      title: `${doc.title}: ${heading}`,
      heading,
      text: `[Документ: ${doc.title}]\n${currentBlock}`,
    });
  }

  return chunks;
}

/**
 * 3. Parse .xlsx Buffer into Structured Semantic Chunks
 */
function parseXlsxBuffer(
  buffer: Buffer,
  doc: DocumentSource
): KnowledgeChunk[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const chunks: KnowledgeChunk[] = [];
  let chunkIndex = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });
    if (rows.length === 0) continue;

    // Normalize column headers (trim & lowercase) so minor edits in Excel/Sheets never break parsing
    const normalizedRows = rows.map((row) => {
      const norm: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        norm[k.trim().toLowerCase()] = String(v ?? '').trim();
      }
      return norm;
    });

    const firstNorm = normalizedRows[0];
    const hasTeacherCol =
      'преподаватель' in firstNorm || 'фио' in firstNorm || 'учитель' in firstNorm;

    if (hasTeacherCol) {
      const teacherMap = new Map<
        string,
        { role: string; exp: string; lines: string[] }
      >();

      for (const row of normalizedRows) {
        const name =
          row['преподаватель'] || row['фио'] || row['учитель'] || '';
        if (!name) continue;
        const role =
          row['должность и профиль'] || row['должность'] || row['профиль'] || '';
        const exp = row['стаж'] || row['опыт'] || '';
        const days = row['дни недели'] || row['дни'] || '';
        const time = row['время занятий'] || row['время'] || '';
        const group =
          row['предмет / группа'] || row['предмет'] || row['группа'] || '';

        if (!teacherMap.has(name)) {
          teacherMap.set(name, { role, exp, lines: [] });
        }
        const detail = [days, time, group].filter(Boolean).join(' | ');
        if (detail) {
          teacherMap.get(name)!.lines.push(`- ${detail}`);
        }
      }

      // Summary chunk with ALL teachers
      const summaryLines = Array.from(teacherMap.entries()).map(
        ([name, info], idx) =>
          `${idx + 1}. ${name}${info.role ? ` — ${info.role}` : ''}${info.exp ? ` (стаж ${info.exp})` : ''}`
      );
      chunks.push({
        id: `${doc.key}#${chunkIndex++}`,
        source: doc.title,
        title: `${doc.title}: Полный список преподавателей`,
        heading: 'Полный список преподавателей',
        text: `[Таблица Excel: ${doc.title} / Лист: ${sheetName}]\nВсего преподавателей: ${teacherMap.size}\n${summaryLines.join('\n')}`,
      });

      // Individual schedule chunk per teacher
      for (const [name, info] of teacherMap.entries()) {
        chunks.push({
          id: `${doc.key}#${chunkIndex++}`,
          source: doc.title,
          title: `${doc.title}: Расписание — ${name}`,
          heading: name,
          text: `[Таблица Excel: ${doc.title} / Лист: ${sheetName}]\nПреподаватель: ${name}\nПрофиль: ${info.role}\nСтаж: ${info.exp}\nРасписание:\n${info.lines.join('\n')}`,
        });
      }
    } else {
      // Generic Excel sheet chunking (e.g., Режим работы, Контакты)
      const lines = rows.map((row) =>
        Object.entries(row)
          .filter(([, v]) => String(v).trim() !== '')
          .map(([k, v]) => `${k.trim()}: ${v}`)
          .join(' | ')
      );

      chunks.push({
        id: `${doc.key}#${chunkIndex++}`,
        source: doc.title,
        title: `${doc.title}: ${sheetName}`,
        heading: sheetName,
        text: `[Таблица Excel: ${doc.title} / Лист: ${sheetName}]\n${lines.join('\n')}`,
      });
    }
  }

  return chunks;
}

/**
 * 4. Fetch Document Buffer from Google Drive API (Service Account) or Public Export URL
 */
async function fetchFromGoogleDrive(
  fileId: string,
  doc: DocumentSource
): Promise<{ buffer: Buffer; version: string }> {
  const auth = getServiceAccountAuth();

  if (auth) {
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const accessToken = tokenRes.token;
    if (!accessToken) {
      throw new Error('Не удалось получить access token от Google Service Account.');
    }

    // 1. Check metadata (mimeType)
    const metaUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?fields=id,name,mimeType,modifiedTime,version&supportsAllDrives=true&_t=${Date.now()}`;
    const metaRes = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!metaRes.ok) {
      const errText = await metaRes.text();
      throw new Error(
        `Google Drive Metadata Error (${metaRes.status}) для ${doc.title}: ${errText}`
      );
    }

    const meta = (await metaRes.json()) as {
      id: string;
      name: string;
      mimeType: string;
      modifiedTime: string;
      version?: string;
    };

    // 2. Always download/export latest bytes to hash exact content (catches even immediate edits)
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&supportsAllDrives=true&_t=${Date.now()}`;

    if (meta.mimeType === 'application/vnd.google-apps.document') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document&_t=${Date.now()}`;
    } else if (meta.mimeType === 'application/vnd.google-apps.spreadsheet') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        fileId
      )}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&_t=${Date.now()}`;
    }

    const fileRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!fileRes.ok) {
      const errText = await fileRes.text();
      throw new Error(
        `Google Drive Download Error (${fileRes.status}) для ${doc.title}: ${errText}`
      );
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { buffer, version: `gdrive:${contentHash}` };
  }

  // Fallback: Public link export (for "Anyone with the link" Google Docs / Sheets / Drive files)
  const publicUrl =
    doc.type === 'docx'
      ? `https://docs.google.com/document/d/${encodeURIComponent(fileId)}/export?format=docx`
      : `https://docs.google.com/spreadsheets/d/${encodeURIComponent(fileId)}/export?format=xlsx`;

  let res = await fetch(publicUrl, { cache: 'no-store' });

  // If it's a raw uploaded .docx/.xlsx file on Drive rather than a native Google Doc/Sheet
  if (!res.ok) {
    const driveRawUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
      fileId
    )}`;
    res = await fetch(driveRawUrl, { cache: 'no-store' });
  }

  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить ${doc.title} из Google Drive (${res.status}). Проверьте доступ или настройте Service Account.`
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { buffer, version: hash };
}

function extractGoogleFileId(rawValue: string): string {
  const trimmed = rawValue.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

/**
 * 5. Load Knowledge Base with Live Freshness Check (Parallel + Content SHA-256)
 */
export async function loadKnowledgeBaseLive(
  forceRefresh = false
): Promise<KnowledgeChunk[]> {
  if (forceRefresh) {
    docChunkCache.clear();
  }

  const kbDir = path.join(process.cwd(), 'knowledge-base');

  const perDocChunks = await Promise.all(
    DOCUMENT_SOURCES.map(async (doc) => {
      const rawId = process.env[doc.googleIdEnv]?.trim();
      const googleFileId = rawId ? extractGoogleFileId(rawId) : '';

      if (googleFileId) {
        const { buffer, version } = await fetchFromGoogleDrive(
          googleFileId,
          doc
        );
        const cached = docChunkCache.get(doc.key);

        if (cached && cached.version === version) {
          return cached.chunks;
        }

        const chunks =
          doc.type === 'docx'
            ? await parseDocxBuffer(buffer, doc)
            : parseXlsxBuffer(buffer, doc);

        console.log(
          `[Google RAG] Обновлен документ "${doc.title}" из Google Drive: ${chunks.length} фрагментов (version=${version.slice(0, 18)}...)`
        );
        docChunkCache.set(doc.key, { version, chunks });
        return chunks;
      }

      // Local .docx / .xlsx fallback with mtimeMs live-reload
      const localPath = path.join(kbDir, doc.localFilename);
      if (!fs.existsSync(localPath)) return [];

      const stat = fs.statSync(localPath);
      const version = `local:${stat.mtimeMs}`;
      const cached = docChunkCache.get(doc.key);

      if (cached && cached.version === version) {
        return cached.chunks;
      }

      const buffer = fs.readFileSync(localPath);
      const chunks =
        doc.type === 'docx'
          ? await parseDocxBuffer(buffer, doc)
          : parseXlsxBuffer(buffer, doc);

      console.log(
        `[Google RAG] Обновлен локальный документ "${doc.title}": ${chunks.length} фрагментов`
      );
      docChunkCache.set(doc.key, { version, chunks });
      return chunks;
    })
  );

  return perDocChunks.flat();
}

/**
 * Force-syncs all documents from Google Drive and re-indexes RAG embeddings.
 */
export async function syncKnowledgeBase() {
  const chunks = await loadKnowledgeBaseLive(true);
  await indexKnowledgeChunks(chunks);

  const summary = DOCUMENT_SOURCES.map((doc) => ({
    key: doc.key,
    title: doc.title,
    chunksCount: chunks.filter((c) => c.source === doc.title).length,
  }));

  return {
    totalChunks: chunks.length,
    documents: summary,
  };
}

/**
 * 6. Generate Vector Embedding via Google AI Studio API
 */
export async function getEmbedding(
  text: string,
  taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT'
): Promise<number[]> {
  const { apiKey, embeddingModel } = getConfig();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY не настроен.');
  }

  const cacheKey = `${embeddingModel}:${taskType}:${text}`;
  const cached = vectorCache.get(cacheKey);
  if (cached) return cached;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${embeddingModel}`,
      content: { parts: [{ text }] },
      taskType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google AI Studio Embedding Error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error(
      'Некорректная структура вектора эмбеддинга от Google AI Studio.'
    );
  }

  vectorCache.set(cacheKey, vector);
  return vector;
}

/**
 * 7. Batch Embed Knowledge Base Chunks
 */
export async function indexKnowledgeChunks(
  chunks: KnowledgeChunk[]
): Promise<KnowledgeChunk[]> {
  const missing = chunks.filter((c) => !c.vector);
  if (missing.length === 0) return chunks;

  const BATCH_SIZE = 10;
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (chunk) => {
        try {
          chunk.vector = await getEmbedding(chunk.text, 'RETRIEVAL_DOCUMENT');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(
            `[Google RAG] Failed to embed chunk ${chunk.id}:`,
            msg
          );
        }
      })
    );
  }
  return chunks;
}

/**
 * 8. Retrieve Top-K Most Relevant Chunks by Cosine Similarity
 */
export async function retrieveRelevantChunks(
  userQuery: string,
  chunks: KnowledgeChunk[],
  topK = 5
): Promise<RetrievedChunk[]> {
  const queryVector = await getEmbedding(userQuery, 'RETRIEVAL_QUERY');

  const scored = chunks
    .filter((c): c is KnowledgeChunk & { vector: number[] } =>
      Boolean(c.vector && Array.isArray(c.vector))
    )
    .map((chunk) => {
      const similarity = cosineSimilarity(queryVector, chunk.vector);
      return {
        ...chunk,
        similarity,
        similarityPercent: Math.round(similarity * 100),
      };
    });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

/**
 * 9. End-to-End Live Vector RAG Call
 */
export async function askGeminiWithRAG({
  messages,
  systemPrompt,
  topK = 5,
}: {
  messages: ChatMessage[];
  systemPrompt?: string;
  topK?: number;
}) {
  const { apiKey, embeddingModel, chatModel } = getConfig();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'Не настроен ключ GEMINI_API_KEY. Добавьте GEMINI_API_KEY в файл .env.local и перезапустите сервер.'
    );
  }

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // Step 1: Load latest docs from Google Drive (or local .docx/.xlsx) & embed new chunks
  const knowledgeBase = await loadKnowledgeBaseLive();
  await indexKnowledgeChunks(knowledgeBase);

  // Step 2: Retrieve top semantic chunks via Cosine Similarity
  const retrievedChunks = await retrieveRelevantChunks(
    lastUserMessage,
    knowledgeBase,
    topK
  );

  // Step 3: Format augmented context
  const contextText = retrievedChunks
    .map(
      (c, i) =>
        `[Источник ${i + 1}: ${c.title} (Релевантность: ${c.similarityPercent}%)]\n${c.text}`
    )
    .join('\n\n---\n\n');

  const baseSystemPrompt =
    systemPrompt ||
    `Ты — вежливый, дружелюбный и точный AI-консультант учебного центра «Академия Будущего» (EduFuture).
Отвечай на вопросы клиентов строго на основе предоставленного ниже RAG-контекста (Прайс-лист из Google Docs/DOCX, FAQ из Google Docs/DOCX, График работы и расписание преподавателей из Excel) и инструментов работы с таблицей записей Google Sheets.

Правила работы:
1. Используй ТОЛЬКО факты, цены (в сумах / UZS), расписание преподавателей, адреса, телефоны и условия из контекста ниже. Не выдумывай несуществующие курсы, скидки или условия.
2. У тебя есть инструменты для работы с живой таблицей записей студентов:
   - \`find_free_slots\`: используй его, когда пользователь спрашивает про свободные окна, свободные места в группе или хочет записаться. В центре предусмотрено **групповое обучение до 12 человек в группе** (и индивидуальный формат). Инструмент возвращает \`spotsLeft\` (сколько мест свободно из 12) и \`bookedCount\`. Всегда указывай количество свободных мест!
   - \`book_student\`: используй его, чтобы записать студента в таблицу Google Sheets. Для записи обязательны: имя ученика (\`studentName\`), телефон (\`phone\`), курс (\`course\`), день недели (\`day\`) и время (\`time\`). Формат по умолчанию — «Очно в центре (группа до 12 чел.)», также возможны «Онлайн (группа до 12 чел.)» и «Индивидуально (1 на 1)». Если чего-то не хватает — вежливо уточни у пользователя перед записью.
3. Если в контексте нет ответа на вопрос пользователя, честно скажи об этом и предложи связаться с методистом приемной комиссии по телефону +7 (495) 790-24-50 или в Telegram (@future_academy_msk).
4. Отвечай структурированно, понятно и лаконично (используй списки и выделение ключевых цифр).
5. Если пользователь спрашивает про дорогие или длительные курсы, обязательно упомяни возможность беспроцентной рассрочки, если это указано в прайс-листе.
6. Отвечай на языке пользователя (по умолчанию — русский).`;

  const fullSystemInstruction = `${baseSystemPrompt}

--- РЕЛЕВАНТНЫЙ КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ (GOOGLE VECTOR EMBEDDINGS) ---
${contextText}
------------------------------------------------------------------------`;

  const bookingTools = [
    {
      functionDeclarations: [
        {
          name: 'find_free_slots',
          description:
            'Найти свободные временные окна для записи нового студента в таблице Google Sheets. Проверяет текущие записи и возвращает свободные дни и часы.',
          parameters: {
            type: 'OBJECT',
            properties: {
              day: {
                type: 'STRING',
                description:
                  'День недели (например: Понедельник, Вторник, Среда, Четверг, Пятница, Суббота, Воскресенье). Необязательно.',
              },
              course: {
                type: 'STRING',
                description:
                  'Название курса или предмета (например: Математика, Английский, IELTS, Python, Информатика). Необязательно.',
              },
              teacher: {
                type: 'STRING',
                description: 'ФИО преподавателя (необязательно).',
              },
            },
          },
        },
        {
          name: 'book_student',
          description:
            'Записать студента в таблицу записей Google Sheets на выбранный курс и свободное окно.',
          parameters: {
            type: 'OBJECT',
            properties: {
              studentName: {
                type: 'STRING',
                description: 'Имя и фамилия студента.',
              },
              phone: {
                type: 'STRING',
                description: 'Контактный номер телефона студента или родителя.',
              },
              course: {
                type: 'STRING',
                description: 'Название выбранного курса.',
              },
              day: {
                type: 'STRING',
                description: 'День недели (например: Понедельник, Суббота).',
              },
              time: {
                type: 'STRING',
                description: 'Время занятия (например: 15:30, 17:00).',
              },
              format: {
                type: 'STRING',
                description: 'Формат обучения: Очно в центре или Онлайн.',
              },
              email: {
                type: 'STRING',
                description: 'Email (если указан).',
              },
              comment: {
                type: 'STRING',
                description: 'Дополнительный комментарий (если есть).',
              },
            },
            required: ['studentName', 'phone', 'course', 'day', 'time'],
          },
        },
      ],
    },
  ];

  // Step 4: Generate response with Gemini (supports multi-step tool calling)
  const contents: Array<Record<string, unknown>> = messages
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chatModel}:generateContent?key=${apiKey}`;

  async function callGeminiOnce(
    conversationContents: Array<Record<string, unknown>>
  ) {
    const genPayload = JSON.stringify({
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }],
      },
      contents: conversationContents,
      tools: bookingTools,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1536,
      },
    });

    let genResponse: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      genResponse = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: genPayload,
      });
      if (
        genResponse.ok ||
        ![500, 502, 503, 429].includes(genResponse.status)
      ) {
        break;
      }
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 400));
      }
    }

    if (!genResponse || !genResponse.ok) {
      const errText = genResponse ? await genResponse.text() : 'No response';
      throw new Error(
        `Google AI Studio Generation Error (${genResponse?.status ?? 500}): ${errText}`
      );
    }

    return genResponse.json();
  }

  let genData = await callGeminiOnce(contents);

  // Execute up to 3 tool call rounds if Gemini requests find_free_slots / book_student
  for (let round = 0; round < 3; round++) {
    const candidateParts: Array<{
      text?: string;
      functionCall?: { name: string; args?: Record<string, unknown> };
    }> = genData?.candidates?.[0]?.content?.parts || [];

    const functionCalls = candidateParts.filter((p) => p.functionCall);
    if (functionCalls.length === 0) break;

    contents.push({
      role: 'model',
      parts: candidateParts,
    });

    const responseParts: Array<Record<string, unknown>> = [];

    for (const part of functionCalls) {
      const fnName = part.functionCall!.name;
      const args = part.functionCall!.args || {};
      let toolResult: unknown;

      try {
        if (fnName === 'find_free_slots') {
          toolResult = await findFreeSlots({
            day: typeof args.day === 'string' ? args.day : undefined,
            course: typeof args.course === 'string' ? args.course : undefined,
            teacher:
              typeof args.teacher === 'string' ? args.teacher : undefined,
          });
        } else if (fnName === 'book_student') {
          toolResult = await appendStudentBooking({
            studentName: String(args.studentName || ''),
            phone: String(args.phone || ''),
            course: String(args.course || ''),
            day: String(args.day || ''),
            time: String(args.time || ''),
            format:
              typeof args.format === 'string' ? args.format : 'Очно в центре',
            email: typeof args.email === 'string' ? args.email : '',
            comment: typeof args.comment === 'string' ? args.comment : '',
          });
        } else {
          toolResult = { error: `Unknown tool: ${fnName}` };
        }
      } catch (toolErr: unknown) {
        toolResult = {
          error:
            toolErr instanceof Error
              ? toolErr.message
              : 'Ошибка выполнения инструмента Google Sheets',
        };
      }

      responseParts.push({
        functionResponse: {
          name: fnName,
          response: { result: toolResult },
        },
      });
    }

    contents.push({
      role: 'user',
      parts: responseParts,
    });

    genData = await callGeminiOnce(contents);
  }
  const answer =
    genData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    'Извините, не удалось сформировать ответ. Пожалуйста, повторите вопрос.';

  const sources = Array.from(
    new Set(
      retrievedChunks.map((c) => `${c.source} (${c.similarityPercent}%)`)
    )
  );

  return {
    answer,
    sources,
    retrievedChunks: retrievedChunks.map((c) => ({
      id: c.id,
      title: c.title,
      source: c.source,
      similarityPercent: c.similarityPercent,
    })),
    model: chatModel,
    embeddingModel,
  };
}
