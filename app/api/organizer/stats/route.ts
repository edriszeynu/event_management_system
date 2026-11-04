import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const organizer = await getAuthenticatedUser(['ORGANIZER']);
  if (!organizer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [events, registrations] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: organizer.id },
      include: { ticketTiers: true },
    }),
    prisma.registration.findMany({
      where: { event: { organizerId: organizer.id } },
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
