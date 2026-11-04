import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
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
