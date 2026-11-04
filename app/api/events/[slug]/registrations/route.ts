import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

const ALLOWED_REGISTRATION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN'] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthenticatedUser(['ATTENDEE']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { ticketTierId, quantity = 1 } = body;

    if (typeof ticketTierId !== 'string' || !Number.isInteger(quantity) || quantity !== 1) {
      return NextResponse.json({ error: 'One ticket per event is currently supported' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Event is not available for registration' }, { status: 409 });
    }

    const ticketTier = await prisma.ticketTier.findFirst({
      where: { id: ticketTierId, eventId: event.id, status: 'ACTIVE' },
    });
    if (!ticketTier) return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
    if (ticketTier.price > 0) {
      return NextResponse.json({ error: 'Paid tickets must be purchased through checkout' }, { status: 402 });
    }
    const now = new Date();
    if (ticketTier.salesStart > now || ticketTier.salesEnd < now || ticketTier.quantitySold >= ticketTier.quantityTotal) {
      return NextResponse.json({ error: 'Ticket sales are unavailable' }, { status: 409 });
    }
    const existingRegistration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: event.id } },
    });
    if (existingRegistration) return NextResponse.json({ error: 'Already registered for this event' }, { status: 409 });

    // Create registrations
    const registrations = [];
    for (let i = 0; i < quantity; i++) {
      const registration = await prisma.registration.create({
        data: {
          userId: user.id,
          eventId: event.id,
          ticketTierId,
          status: 'CONFIRMED',
          qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });
      registrations.push(registration);
    }

    // Update ticket tier sold count
    await prisma.ticketTier.update({
      where: { id: ticketTierId },
      data: {
        quantitySold: {
          increment: quantity,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      registrations: registrations.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  if (user.role !== 'SUPER_ADMIN' && !(user.role === 'ORGANIZER' && event.organizerId === user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const where: Prisma.RegistrationWhereInput = { eventId: event.id };
  if (status && ALLOWED_REGISTRATION_STATUSES.includes(status as typeof ALLOWED_REGISTRATION_STATUSES[number])) {
    where.status = status as typeof ALLOWED_REGISTRATION_STATUSES[number];
  }
  if (search) {
    where.user = {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      ticketTier: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter((r) => r.status === 'CHECKED_IN').length,
    pending: registrations.filter((r) => r.status === 'PENDING').length,
    cancelled: registrations.filter((r) => r.status === 'CANCELLED').length,
  };

  return NextResponse.json({
    registrations: registrations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    stats,
  });
}
