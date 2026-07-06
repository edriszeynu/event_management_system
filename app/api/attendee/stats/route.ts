import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { id } = JSON.parse(Buffer.from(token, 'base64').toString());
    return id as string;
  } catch { return null; }
}

export async function GET() {
  const userId = await getUserFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: { event: { select: { startDate: true } } },
  });

  const now = new Date();
  return NextResponse.json({
    totalTickets: registrations.length,
    upcomingEvents: registrations.filter((r) => r.event.startDate > now).length,
    pastEvents: registrations.filter((r) => r.event.startDate <= now).length,
    pendingNotifications: 0,
  });
}
