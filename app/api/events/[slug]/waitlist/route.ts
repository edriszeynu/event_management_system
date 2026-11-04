import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ slug: string }> };

async function getWaitlistEntry(eventId: string, userId: string) {
  return prisma.waitlist.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const entry = await getWaitlistEntry(event.id, user.id);
  if (!entry || entry.status !== 'WAITING') return NextResponse.json({ entry: null });

  const position = await prisma.waitlist.count({
    where: {
      eventId: event.id,
      status: 'WAITING',
      registeredAt: { lte: entry.registeredAt },
    },
  });

  return NextResponse.json({
    entry: { id: entry.id, registeredAt: entry.registeredAt.toISOString(), position },
  });
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { ticketTiers: { select: { quantitySold: true, quantityTotal: true, status: true } } },
  });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (event.status !== 'PUBLISHED' || event.startDate <= new Date()) {
    return NextResponse.json({ error: 'This event is not accepting waitlist entries' }, { status: 409 });
  }

  const hasAvailableTickets = event.ticketTiers.some(
    (tier) => tier.status === 'ACTIVE' && tier.quantitySold < tier.quantityTotal
  );
  if (event.ticketTiers.length === 0 || hasAvailableTickets) {
    return NextResponse.json({ error: 'Tickets are still available for this event' }, { status: 409 });
  }

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: event.id } },
  });
  if (registration && registration.status !== 'CANCELLED') {
    return NextResponse.json({ error: 'You already have a ticket for this event' }, { status: 409 });
  }

  const existing = await getWaitlistEntry(event.id, user.id);
  if (existing?.status === 'WAITING') return NextResponse.json({ success: true });

  if (existing) {
    await prisma.waitlist.update({
      where: { id: existing.id },
      data: { status: 'WAITING', registeredAt: new Date(), promotedAt: null },
    });
  } else {
    await prisma.waitlist.create({ data: { eventId: event.id, userId: user.id } });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  await prisma.waitlist.deleteMany({ where: { eventId: event.id, userId: user.id, status: 'WAITING' } });
  return NextResponse.json({ success: true });
}