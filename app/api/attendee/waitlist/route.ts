import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const entries = await prisma.waitlist.findMany({
    where: { userId: user.id, status: 'WAITING' },
    include: {
      event: {
        select: { id: true, title: true, slug: true, startDate: true, bannerImage: true, eventType: true, venueAddress: true },
      },
    },
    orderBy: { registeredAt: 'asc' },
  });

  const entriesWithPositions = await Promise.all(entries.map(async (entry) => {
    const position = await prisma.waitlist.count({
      where: {
        eventId: entry.eventId,
        status: 'WAITING',
        registeredAt: { lte: entry.registeredAt },
      },
    });

    return {
      id: entry.id,
      registeredAt: entry.registeredAt.toISOString(),
      position,
      event: { ...entry.event, startDate: entry.event.startDate.toISOString() },
    };
  }));

  return NextResponse.json(entriesWithPositions);
}