import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  source: string;
  sourceTitle: string;
  heading: string;
  content: string;
}

const SOURCE_TITLES: Record<string, string> = {
  '01_price_list.md': 'Прайс-лист',
  '02_faq.md': 'FAQ',
  '03_schedule_and_contacts.md': 'График работы и контакты',
};

let cachedChunks: KnowledgeChunk[] | null = null;

/**
 * Normalizes text into lowercase word tokens (supports Cyrillic and Latin).
 * Uses light prefix stemming (first 5 chars for longer words) to improve Russian inflection matching.
 */
function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[а-яёa-z0-9]+/gi) ?? [];
  return matches
    .filter((w) => w.length >= 2)
    .map((w) => (w.length > 5 ? w.slice(0, 5) : w));
}

/**
 * Loads and chunks all Markdown files from the knowledge-base directory.
 */
export function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedChunks) {
    return cachedChunks;
  }

  const kbDir = path.join(process.cwd(), 'knowledge-base');
  if (!fs.existsSync(kbDir)) {
    return [];
  }

  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith('.md')).sort();
  const chunks: KnowledgeChunk[] = [];

  for (const file of files) {
    const filePath = path.join(kbDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const sourceTitle = SOURCE_TITLES[file] ?? file;

    // Split by ## or ### headings while preserving the heading in each chunk
    const sections = raw.split(/\n(?=#{2,3}\s)/g);

    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed || trimmed === '---') return;

      const firstLine = trimmed.split('\n')[0] ?? '';
      const heading = firstLine.replace(/^#{1,3}\s*/, '').trim() || sourceTitle;

      chunks.push({
        id: `${file}#${index}`,
        source: file,
        sourceTitle,
        heading,
        content: trimmed,
      });
    });
  }

  cachedChunks = chunks;
  return chunks;
}

/**
 * Retrieves top-K most relevant knowledge chunks for a user query.
 */
export function retrieveRelevantChunks(
  query: string,
  topK = 6
): { chunks: KnowledgeChunk[]; sources: string[] } {
  const allChunks = loadKnowledgeBase();
  if (allChunks.length === 0) {
    return { chunks: [], sources: [] };
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    const fallback = allChunks.slice(0, topK);
    return {
      chunks: fallback,
      sources: Array.from(new Set(fallback.map((c) => c.sourceTitle))),
    };
  }

  const scored = allChunks.map((chunk) => {
    const contentTokens = new Set(tokenize(chunk.content));
    const headingTokens = new Set(tokenize(chunk.heading));
    const sourceTokens = new Set(tokenize(chunk.sourceTitle));

    let score = 0;
    for (const token of queryTokens) {
      if (headingTokens.has(token)) score += 3;
      if (sourceTokens.has(token)) score += 2;
      if (contentTokens.has(token)) score += 1;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const positive = scored.filter((item) => item.score > 0).slice(0, topK).map((i) => i.chunk);

  // If no strong keyword match (e.g. general greeting or broad question), provide representative chunks from all 3 docs
  const selected =
    positive.length > 0
      ? positive
      : [
          ...allChunks.filter((c) => c.source === '01_price_list.md').slice(0, 2),
          ...allChunks.filter((c) => c.source === '02_faq.md').slice(0, 2),
          ...allChunks.filter((c) => c.source === '03_schedule_and_contacts.md').slice(0, 2),
        ];

  const sources = Array.from(new Set(selected.map((c) => c.sourceTitle)));
  return { chunks: selected, sources };
}
