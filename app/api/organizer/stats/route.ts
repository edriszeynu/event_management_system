import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

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

  const [events, registrations] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId },
      include: { ticketTiers: true },
    }),
    prisma.registration.findMany({
      where: { event: { organizerId } },
    }),
  ]);

  const totalRevenue = events.reduce(
    (sum, e) => sum + e.ticketTiers.reduce((s, t) => s + t.price * t.quantitySold, 0),
    0
  );

  const upcoming = events.filter((e) => e.startDate > new Date()).length;

  return NextResponse.json({
    totalEvents: events.length,
    totalAttendees: registrations.length,
    revenue: totalRevenue,
    upcomingEvents: upcoming,
  });
}
