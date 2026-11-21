import { NextResponse } from 'next/server';
import { syncKnowledgeBase } from '@/lib/googleRagEngine';

export async function POST() {
  try {
    const result = await syncKnowledgeBase();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err: unknown) {
    console.error('RAG Sync error:', err);
    const message =
      err instanceof Error ? err.message : 'Ошибка синхронизации с Google Drive';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
