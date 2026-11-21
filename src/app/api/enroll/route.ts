import { NextRequest, NextResponse } from 'next/server';
import {
  appendStudentBooking,
  findFreeSlots,
} from '@/lib/googleSheetsBooking';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day') || undefined;
    const course = searchParams.get('course') || undefined;
    const teacher = searchParams.get('teacher') || undefined;

    const result = await findFreeSlots({ day, course, teacher });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    console.error('GET /api/enroll error:', err);
    const message =
      err instanceof Error ? err.message : 'Ошибка загрузки свободных окон';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentName = String(body?.name || body?.studentName || '').trim();
    const phone = String(body?.phone || '').trim();
    const course = String(body?.course || '').trim();

    if (!studentName || !phone || !course) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Необходимо указать имя ученика, телефон и выбранный курс.',
        },
        { status: 400 }
      );
    }

    const result = await appendStudentBooking({
      studentName,
      phone,
      email: body?.email,
      course,
      format: body?.format,
      day: body?.day,
      time: body?.time,
      teacher: body?.teacher,
      comment: body?.comment,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('POST /api/enroll error:', err);
    const message =
      err instanceof Error ? err.message : 'Ошибка записи в Google Таблицу';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
