import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: true,
      ticketTiers: true,
      sessions: { include: { speaker: true } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    registrationsCount: event._count.registrations,
  });
}
