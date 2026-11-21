import { GoogleAuth } from 'google-auth-library';

export interface StudentBooking {
  createdAt: string;
  studentName: string;
  phone: string;
  email: string;
  course: string;
  format: string;
  day: string;
  time: string;
  teacher: string;
  comment: string;
  status: string;
}

export const GROUP_MAX_CAPACITY = 12;

export interface FreeSlot {
  day: string;
  time: string;
  teacher: string;
  courseHint: string;
  bookedCount: number;
  maxCapacity: number;
  spotsLeft: number;
}

const SHEET_HEADERS = [
  'Дата записи',
  'Имя ученика',
  'Телефон',
  'Email',
  'Курс',
  'Формат',
  'День недели',
  'Время',
  'Преподаватель',
  'Комментарий',
  'Статус',
];

const WEEKDAY_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00', '18:30', '19:30'];
const SATURDAY_SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00'];
const SUNDAY_SLOTS = ['10:30', '12:00', '13:30', '15:00'];

const ALL_DAYS: Array<{ day: string; slots: string[] }> = [
  { day: 'Понедельник', slots: WEEKDAY_SLOTS },
  { day: 'Вторник', slots: WEEKDAY_SLOTS },
  { day: 'Среда', slots: WEEKDAY_SLOTS },
  { day: 'Четверг', slots: WEEKDAY_SLOTS },
  { day: 'Пятница', slots: WEEKDAY_SLOTS },
  { day: 'Суббота', slots: SATURDAY_SLOTS },
  { day: 'Воскресенье', slots: SUNDAY_SLOTS },
];

function inferTeacherByCourse(course: string): string {
  const lower = course.toLowerCase();
  if (
    lower.includes('англ') ||
    lower.includes('ielts') ||
    lower.includes('toefl') ||
    lower.includes('english') ||
    lower.includes('cefr') ||
    lower.includes('speaking')
  ) {
    return 'Смирнова Елена Викторовна';
  }
  if (
    lower.includes('информат') ||
    lower.includes('python') ||
    lower.includes('web') ||
    lower.includes('frontend') ||
    lower.includes('react') ||
    lower.includes('it') ||
    lower.includes('программир')
  ) {
    return 'Ковалев Дмитрий Андреевич';
  }
  if (lower.includes('огэ') || lower.includes('5–') || lower.includes('5-')) {
    return 'Соколова Анастасия Павловна';
  }
  return 'Воронов Александр Сергеевич';
}

function getSpreadsheetId(): string {
  const raw =
    process.env.GOOGLE_BOOKINGS_SHEET_ID?.trim() ||
    '1CC9Ou9LGxPvOhxt300AHiJa82OJ8WjwQIl5XYFe9b7k';
  const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : raw;
}

async function getSheetsAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Не настроены GOOGLE_CLIENT_EMAIL или GOOGLE_PRIVATE_KEY в .env.local'
    );
  }

  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  if (!tokenRes.token) {
    throw new Error('Не удалось получить access token для Google Sheets API.');
  }
  return tokenRes.token;
}

async function getFirstSheetName(
  spreadsheetId: string,
  token: string
): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}?fields=sheets.properties.title`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 403 && text.includes('sheets.googleapis.com')) {
      throw new Error(
        'Google Sheets API не включен в Google Cloud Console. Включите его по ссылке: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=852635596808'
      );
    }
    throw new Error(`Google Sheets Error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };
  return data.sheets?.[0]?.properties?.title || 'Sheet1';
}

async function ensureHeaders(
  spreadsheetId: string,
  sheetName: string,
  token: string
): Promise<void> {
  const range = encodeURIComponent(`${sheetName}!A1:K1`);
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}`;

  const res = await fetch(readUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return;
  const data = (await res.json()) as { values?: string[][] };
  const firstRow = data.values?.[0] || [];

  if (firstRow.length === 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${range}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    });
  }
}

/**
 * Reads all student bookings from Google Sheet
 */
export async function listBookings(): Promise<StudentBooking[]> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getSheetsAccessToken();
  const sheetName = await getFirstSheetName(spreadsheetId, token);

  const range = encodeURIComponent(`${sheetName}!A2:K500`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка чтения Google Таблицы (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  const rows = data.values || [];

  return rows
    .filter((r) => r.some((cell) => String(cell || '').trim() !== ''))
    .map((r) => ({
      createdAt: r[0] || '',
      studentName: r[1] || '',
      phone: r[2] || '',
      email: r[3] || '',
      course: r[4] || '',
      format: r[5] || '',
      day: r[6] || '',
      time: r[7] || '',
      teacher: r[8] || '',
      comment: r[9] || '',
      status: r[10] || 'Записан',
    }));
}

/**
 * Finds available free windows by comparing standard schedule slots against active bookings in Google Sheet
 */
export async function findFreeSlots(params?: {
  day?: string;
  course?: string;
  teacher?: string;
}): Promise<{
  freeSlots: FreeSlot[];
  totalBooked: number;
  resolvedTeacher: string;
}> {
  const bookings = await listBookings();
  const activeBookings = bookings.filter(
    (b) => !b.status.toLowerCase().includes('отмен')
  );

  const resolvedTeacher =
    params?.teacher?.trim() ||
    (params?.course ? inferTeacherByCourse(params.course) : '');

  const dayFilter = params?.day?.trim().toLowerCase() || '';

  const matchingDays = dayFilter
    ? ALL_DAYS.filter((d) => d.day.toLowerCase().includes(dayFilter))
    : ALL_DAYS;

  const targetDays = matchingDays.length > 0 ? matchingDays : ALL_DAYS;
  const freeSlots: FreeSlot[] = [];

  for (const d of targetDays) {
    for (const slotTime of d.slots) {
      const matchingBookings = activeBookings.filter((b) => {
        const sameDay =
          b.day.toLowerCase().includes(d.day.toLowerCase()) ||
          d.day.toLowerCase().includes(b.day.toLowerCase());
        const sameTime = b.time.includes(slotTime);
        if (!sameDay || !sameTime) return false;
        if (resolvedTeacher && b.teacher) {
          return b.teacher
            .toLowerCase()
            .includes(resolvedTeacher.split(' ')[0].toLowerCase());
        }
        return true;
      });

      const hasIndividualBooking = matchingBookings.some((b) =>
        b.format.toLowerCase().includes('индивид')
      );
      const bookedCount = matchingBookings.length;
      const spotsLeft = hasIndividualBooking
        ? 0
        : Math.max(0, GROUP_MAX_CAPACITY - bookedCount);

      if (spotsLeft > 0) {
        freeSlots.push({
          day: d.day,
          time: slotTime,
          teacher: resolvedTeacher || 'По выбранному курсу',
          courseHint: params?.course || 'Любой курс',
          bookedCount,
          maxCapacity: GROUP_MAX_CAPACITY,
          spotsLeft,
        });
      }
    }
  }

  return {
    freeSlots: freeSlots.slice(0, 18),
    totalBooked: activeBookings.length,
    resolvedTeacher: resolvedTeacher || 'Не уточнен',
  };
}

/**
 * Appends a new student booking to Google Sheet
 */
export async function appendStudentBooking(input: {
  studentName: string;
  phone: string;
  email?: string;
  course: string;
  format?: string;
  day?: string;
  time?: string;
  teacher?: string;
  comment?: string;
}): Promise<{
  ok: boolean;
  booking: StudentBooking;
  spreadsheetUrl: string;
}> {
  const spreadsheetId = getSpreadsheetId();
  const token = await getSheetsAccessToken();
  const sheetName = await getFirstSheetName(spreadsheetId, token);

  await ensureHeaders(spreadsheetId, sheetName, token);

  const teacher =
    input.teacher?.trim() || inferTeacherByCourse(input.course || '');
  const now = new Date().toLocaleString('ru-RU', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const booking: StudentBooking = {
    createdAt: now,
    studentName: input.studentName.trim(),
    phone: input.phone.trim(),
    email: (input.email || '').trim(),
    course: input.course.trim(),
    format: input.format?.trim() || 'Очно в центре (группа до 12 чел.)',
    day: input.day?.trim() || 'По согласованию',
    time: input.time?.trim() || 'По согласованию',
    teacher,
    comment: (input.comment || '').trim(),
    status: 'Записан',
  };

  // Check slot capacity (up to 12 people for group learning, 1 for individual)
  if (
    booking.day !== 'По согласованию' &&
    booking.time !== 'По согласованию'
  ) {
    const existing = await listBookings();
    const slotBookings = existing.filter(
      (b) =>
        !b.status.toLowerCase().includes('отмен') &&
        b.day.toLowerCase() === booking.day.toLowerCase() &&
        b.time === booking.time &&
        b.teacher
          .toLowerCase()
          .includes(booking.teacher.split(' ')[0].toLowerCase())
    );

    const isIndividualRequest = booking.format
      .toLowerCase()
      .includes('индивид');
    const hasIndividualExisting = slotBookings.some((b) =>
      b.format.toLowerCase().includes('индивид')
    );

    if (hasIndividualExisting || (isIndividualRequest && slotBookings.length > 0)) {
      throw new Error(
        `Окно ${booking.day} в ${booking.time} у преподавателя ${booking.teacher} уже занято. Пожалуйста, выберите другое свободное окно.`
      );
    }

    if (slotBookings.length >= GROUP_MAX_CAPACITY) {
      throw new Error(
        `Группа на ${booking.day} в ${booking.time} у преподавателя ${booking.teacher} уже полностью укомплектована (${GROUP_MAX_CAPACITY}/${GROUP_MAX_CAPACITY} мест). Пожалуйста, выберите другое свободное окно.`
      );
    }
  }

  const rowValues = [
    booking.createdAt,
    booking.studentName,
    booking.phone,
    booking.email,
    booking.course,
    booking.format,
    booking.day,
    booking.time,
    booking.teacher,
    booking.comment,
    booking.status,
  ];

  const appendRange = encodeURIComponent(`${sheetName}!A:K`);
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [rowValues] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка записи в Google Таблицу (${res.status}): ${text}`);
  }

  return {
    ok: true,
    booking,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
