import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { format, subDays } from 'date-fns';

async function getOrganizerFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { id } = JSON.parse(Buffer.from(token, 'base64').toString());
    return id as string;
  } catch {
    return null;
  }
}

export async function GET() {
  const organizerId = await getOrganizerFromCookie();
  if (!organizerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thirtyDaysAgo = subDays(new Date(), 30);

  const registrations = await prisma.registration.findMany({
    where: {
      event: { organizerId },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const grouped: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'MMM d');
    grouped[day] = 0;
  }
  for (const reg of registrations) {
    const day = format(reg.createdAt, 'MMM d');
    if (day in grouped) grouped[day]++;
  }

  return NextResponse.json(
    Object.entries(grouped).map(([date, registrations]) => ({ date, registrations }))
  );
}
