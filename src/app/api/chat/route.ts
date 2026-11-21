import { NextRequest, NextResponse } from 'next/server';
import { askGeminiWithRAG, ChatMessage } from '@/lib/googleRagEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Пустой запрос. Пожалуйста, введите сообщение.' },
        { status: 400 }
      );
    }

    const result = await askGeminiWithRAG({
      messages,
      topK: 4,
    });

    return NextResponse.json({
      reply: result.answer,
      sources: result.sources,
      retrievedChunks: result.retrievedChunks,
      model: result.model,
      embeddingModel: result.embeddingModel,
    });
  } catch (err: unknown) {
    console.error('Google Vector RAG API error:', err);
    const message =
      err instanceof Error
        ? err.message
        : 'Внутренняя ошибка при обращении к Google AI Studio RAG';
    return NextResponse.json(
      { error: `Ошибка AI-ассистента: ${message}` },
      { status: 500 }
    );
  }
}
