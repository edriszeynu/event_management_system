import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

const ALLOWED_EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED'] as const;

export async function POST(req: NextRequest) {
  try {
    const organizer = await getAuthenticatedUser(['ORGANIZER']);
    if (!organizer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      tags,
      eventType,
      startDate,
      endDate,
      timezone,
      venueAddress,
      virtualLink,
      maxCapacity,
      bannerImage,
      ticketTiers,
      speakers,
      sessions,
    } = body;

    if (typeof bannerImage !== 'string' || !bannerImage.trim()) {
      return NextResponse.json({ error: 'Upload an event banner before creating the event.' }, { status: 400 });
    }

    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create event with related data
    const tierInputs = Array.isArray(ticketTiers) ? ticketTiers as Array<{
      name: string;
      description?: string;
      price: number;
      quantityTotal: number;
      salesStart?: string;
      salesEnd?: string;
    }> : [];
    const speakerInputs = Array.isArray(speakers) ? speakers as Array<{
      name: string;
      bio?: string;
      photo?: string;
      company?: string;
      socialLinks?: Record<string, string>;
    }> : [];
    const sessionInputs = Array.isArray(sessions) ? sessions as Array<{
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      room?: string;
      speakerId?: string;
    }> : [];

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        category,
        tags: tags || [],
        eventType,
        status: 'DRAFT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        timezone: timezone || 'UTC',
        venueAddress: venueAddress || '',
        virtualLink: virtualLink || '',
        maxCapacity: maxCapacity || 100,
        bannerImage: bannerImage.trim(),
        organizerId: organizer.id,
        ticketTiers: {
          create: tierInputs.map((tier) => ({
            name: tier.name,
            description: tier.description || '',
            price: tier.price,
            currency: 'USD',
            quantityTotal: tier.quantityTotal,
            quantitySold: 0,
            salesStart: tier.salesStart ? new Date(tier.salesStart) : new Date(startDate),
            salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : new Date(endDate),
            status: 'ACTIVE',
          })),
        },
      },
      include: {
        ticketTiers: true,
        speakers: true,
        sessions: true,
      },
    });

    const speakerIdMap = new Map<string, string>();
    for (const [speakerIndex, speaker] of speakerInputs.entries()) {
      if (!speaker.name?.trim()) continue;
      const savedSpeaker = await prisma.speaker.create({
        data: {
          eventId: event.id,
          name: speaker.name.trim(),
          bio: speaker.bio || null,
          photo: speaker.photo || null,
          company: speaker.company || null,
          socialLinks: speaker.socialLinks,
        },
      });
      speakerIdMap.set(`new-${speakerIndex}`, savedSpeaker.id);
    }

    for (const session of sessionInputs) {
      if (!session.title?.trim()) continue;
      const sessionStart = session.startTime ? new Date(session.startTime) : new Date(startDate);
      const eventEnd = new Date(endDate);
      const sessionEnd = session.endTime
        ? new Date(session.endTime)
        : eventEnd > sessionStart
          ? eventEnd
          : new Date(sessionStart.getTime() + 60 * 60 * 1000);
      await prisma.session.create({
        data: {
          eventId: event.id,
          title: session.title.trim(),
          description: session.description || null,
          startTime: sessionStart,
          endTime: sessionEnd,
          room: session.room || null,
          speakerId: session.speakerId ? speakerIdMap.get(session.speakerId) ?? null : null,
        },
      });
    }

    const relatedEventData = await prisma.event.findUnique({
      where: { id: event.id },
      include: { ticketTiers: true, speakers: true, sessions: true },
    });

    return NextResponse.json({ 
      success: true,
      event: {
        ...relatedEventData,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const organizer = await getAuthenticatedUser(['ORGANIZER']);
  if (!organizer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: Prisma.EventWhereInput = { organizerId: organizer.id };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status && ALLOWED_EVENT_STATUSES.includes(status as typeof ALLOWED_EVENT_STATUSES[number])) {
    where.status = status as typeof ALLOWED_EVENT_STATUSES[number];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        ticketTiers: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  const formatted = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    status: e.status,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    registrationsCount: e._count.registrations,
    revenue: e.ticketTiers.reduce((sum, t) => sum + t.price * t.quantitySold, 0),
  }));

  return NextResponse.json({ events: formatted, total });
}
