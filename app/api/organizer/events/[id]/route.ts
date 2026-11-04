import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

const EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'tags',
  'eventType',
  'startDate',
  'endDate',
  'timezone',
  'venueAddress',
  'virtualLink',
  'maxCapacity',
  'bannerImage',
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(['ORGANIZER', 'SUPER_ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
  }

  const ownershipFilter = user.role === 'SUPER_ADMIN' ? {} : { organizerId: user.id };
  const event = await prisma.event.findFirst({
    where: { id, ...ownershipFilter },
    include: {
      ticketTiers: true,
      sessions: { include: { speaker: true } },
      organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const eventSpeakers = await prisma.speaker.findMany({ where: { eventId: id } });
  const speakersById = new Map(eventSpeakers.map((speaker) => [speaker.id, speaker]));
  for (const session of event.sessions) {
    if (session.speaker) speakersById.set(session.speaker.id, session.speaker);
  }

  return NextResponse.json({
    ...event,
    speakers: Array.from(speakersById.values()),
    sessions: event.sessions.map((session) => ({
      ...session,
      speakerId: session.speakerId ?? session.speaker?.id ?? null,
    })),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(['ORGANIZER', 'SUPER_ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
  }

  const ownershipFilter = user.role === 'SUPER_ADMIN' ? {} : { organizerId: user.id };
  const event = await prisma.event.findFirst({
    where: { id, ...ownershipFilter },
    include: {
      _count: { select: { registrations: true, waitlist: true, feedback: true } },
      ticketTiers: { select: { id: true } },
      sessions: { select: { id: true } },
      speakers: { select: { id: true } },
    },
  });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (event._count.registrations > 0) {
    return NextResponse.json(
      { error: 'This event has registrations and cannot be permanently deleted. Cancel the event instead.' },
      { status: 409 },
    );
  }

  try {
    await prisma.waitlist.deleteMany({ where: { eventId: id } });
    await prisma.feedback.deleteMany({ where: { eventId: id } });
    await prisma.session.deleteMany({ where: { eventId: id } });
    await prisma.ticketTier.deleteMany({ where: { eventId: id } });
    await prisma.speaker.updateMany({ where: { eventId: id }, data: { eventId: null } });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json({ error: 'Could not delete the event. Please try again.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(['ORGANIZER', 'SUPER_ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ownershipFilter = user.role === 'SUPER_ADMIN' ? {} : { organizerId: user.id };

  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

  const existing = await prisma.event.findFirst({ where: { id, ...ownershipFilter } });
  if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in input) data[field] = input[field];
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });

  if ('title' in data && (typeof data.title !== 'string' || !data.title.trim())) {
    return NextResponse.json({ error: 'A valid title is required' }, { status: 400 });
  }
  if ('tags' in data && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string'))) {
    return NextResponse.json({ error: 'Tags must be a list of strings' }, { status: 400 });
  }
  if ('eventType' in data && !['PHYSICAL', 'VIRTUAL', 'HYBRID'].includes(String(data.eventType))) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }
  for (const field of ['startDate', 'endDate'] as const) {
    if (field in data) {
      const date = new Date(String(data[field]));
      if (Number.isNaN(date.getTime())) return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
      data[field] = date;
    }
  }
  if ('maxCapacity' in data && (!Number.isInteger(data.maxCapacity) || Number(data.maxCapacity) < 1)) {
    return NextResponse.json({ error: 'Capacity must be a positive whole number' }, { status: 400 });
  }
  if ('bannerImage' in data) {
    if (data.bannerImage !== null && typeof data.bannerImage !== 'string') {
      return NextResponse.json({ error: 'Invalid banner image' }, { status: 400 });
    }
    data.bannerImage = typeof data.bannerImage === 'string' && data.bannerImage.trim()
      ? data.bannerImage.trim()
      : null;
  }

  const submittedTiers = Array.isArray(input.ticketTiers)
    ? input.ticketTiers as Array<Record<string, unknown>>
    : null;
  const submittedSpeakers = Array.isArray(input.speakers)
    ? input.speakers as Array<Record<string, unknown>>
    : null;
  const submittedSessions = Array.isArray(input.sessions)
    ? input.sessions as Array<Record<string, unknown>>
    : null;

  if (input.ticketTiers !== undefined && !submittedTiers) {
    return NextResponse.json({ error: 'Ticket tiers must be a list.' }, { status: 400 });
  }
  if (input.speakers !== undefined && !submittedSpeakers) {
    return NextResponse.json({ error: 'Speakers must be a list.' }, { status: 400 });
  }
  if (input.sessions !== undefined && !submittedSessions) {
    return NextResponse.json({ error: 'Sessions must be a list.' }, { status: 400 });
  }
  const existingSessions = submittedSessions
    ? await prisma.session.findMany({ where: { eventId: id } })
    : [];
  if (submittedTiers?.some((tier) =>
    typeof tier.name !== 'string' || !tier.name.trim() ||
    typeof tier.price !== 'number' || !Number.isFinite(tier.price) || tier.price < 0 ||
    typeof tier.quantityTotal !== 'number' || !Number.isInteger(tier.quantityTotal) || tier.quantityTotal < 1
  )) {
    return NextResponse.json({ error: 'Each ticket tier needs a name, valid price, and positive quantity.' }, { status: 400 });
  }
  if (submittedSpeakers?.some((speaker) => typeof speaker.name !== 'string' || !speaker.name.trim())) {
    return NextResponse.json({ error: 'Each speaker needs a name.' }, { status: 400 });
  }
  if (submittedSessions?.some((session) => {
    if (typeof session.title !== 'string' || !session.title.trim()) return true;
    const existingSession = typeof session.id === 'string'
      ? existingSessions.find((candidate) => candidate.id === session.id)
      : undefined;
    const startTime = session.startTime !== undefined
      ? new Date(String(session.startTime))
      : existingSession?.startTime ?? new Date(String(data.startDate ?? existing.startDate));
    let endTime = session.endTime !== undefined
      ? new Date(String(session.endTime))
      : existingSession?.endTime ?? new Date(String(data.endDate ?? existing.endDate));
    if (!existingSession && session.endTime === undefined && endTime <= startTime) {
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    }
    return Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime;
  })) {
    return NextResponse.json({ error: 'Each session needs a title and a valid time range.' }, { status: 400 });
  }

  const validTiers = submittedTiers as Array<{
    id?: string;
    name: string;
    description?: string;
    price: number;
    quantityTotal: number;
    quantitySold?: number;
    salesStart?: string | Date;
    salesEnd?: string | Date;
  }> | null;
  const validSpeakers = submittedSpeakers as Array<{
    id?: string;
    name: string;
    bio?: string;
    photo?: string;
    company?: string;
    socialLinks?: Record<string, string>;
  }> | null;
  const validSessions = submittedSessions as Array<{
    id?: string;
    title: string;
    description?: string;
    room?: string;
    startTime: string | Date;
    endTime: string | Date;
    speakerId?: string;
  }> | null;

  try {
    if (validTiers) {
      const existingTiers = await prisma.ticketTier.findMany({
        where: { eventId: id },
        include: { _count: { select: { registrations: true } } },
      });
      const submittedTierIds = validTiers.flatMap((tier) => typeof tier.id === 'string' ? [tier.id] : []);

      for (const tier of existingTiers) {
        if (!submittedTierIds.includes(tier.id)) {
          if (tier.quantitySold === 0 && tier._count.registrations === 0) {
            await prisma.ticketTier.delete({ where: { id: tier.id } });
          } else {
            await prisma.ticketTier.update({ where: { id: tier.id }, data: { status: 'CANCELLED' } });
          }
        }
      }

      for (const tier of validTiers) {
        const existingTier = existingTiers.find((candidate) => candidate.id === tier.id);
        const tierData = {
          name: tier.name.trim(),
          description: typeof tier.description === 'string' ? tier.description : '',
          price: tier.price,
          quantityTotal: Math.max(tier.quantityTotal, existingTier?.quantitySold ?? 0),
          salesStart: tier.salesStart ? new Date(String(tier.salesStart)) : existingTier?.salesStart ?? existing.startDate,
          salesEnd: tier.salesEnd ? new Date(String(tier.salesEnd)) : existingTier?.salesEnd ?? existing.endDate,
          status: 'ACTIVE' as const,
        };

        if (existingTier) {
          await prisma.ticketTier.update({ where: { id: existingTier.id }, data: tierData });
        } else {
          await prisma.ticketTier.create({ data: { ...tierData, eventId: id, quantitySold: 0 } });
        }
      }
    }

    const speakerIdMap = new Map<string, string>();
    if (validSpeakers) {
      const existingSpeakers = await prisma.speaker.findMany({ where: { eventId: id } });
      const submittedSpeakerIds = validSpeakers.flatMap((speaker) => typeof speaker.id === 'string' ? [speaker.id] : []);

      for (const speaker of existingSpeakers) {
        if (!submittedSpeakerIds.includes(speaker.id)) {
          await prisma.speaker.update({ where: { id: speaker.id }, data: { eventId: null } });
        }
      }

      for (const [speakerIndex, speaker] of validSpeakers.entries()) {
        const speakerData = {
          name: speaker.name.trim(),
          bio: typeof speaker.bio === 'string' ? speaker.bio : null,
          photo: typeof speaker.photo === 'string' && speaker.photo ? speaker.photo : null,
          company: typeof speaker.company === 'string' ? speaker.company : null,
          socialLinks: speaker.socialLinks && typeof speaker.socialLinks === 'object'
            ? speaker.socialLinks as object
            : undefined,
        };
        const existingSpeaker = existingSpeakers.find((candidate) => candidate.id === speaker.id);
        const savedSpeaker = existingSpeaker
          ? await prisma.speaker.update({ where: { id: existingSpeaker.id }, data: speakerData })
          : await prisma.speaker.create({ data: { ...speakerData, eventId: id } });
        speakerIdMap.set(typeof speaker.id === 'string' ? speaker.id : savedSpeaker.id, savedSpeaker.id);
        speakerIdMap.set(`new-${speakerIndex}`, savedSpeaker.id);
      }
    }

    if (validSessions) {
      const submittedSessionIds = validSessions.flatMap((session) => typeof session.id === 'string' ? [session.id] : []);
      for (const session of existingSessions) {
        if (!submittedSessionIds.includes(session.id)) {
          await prisma.session.delete({ where: { id: session.id } });
        }
      }

      for (const session of validSessions) {
        const existingSession = existingSessions.find((candidate) => candidate.id === session.id);
        const startTime = session.startTime !== undefined
          ? new Date(String(session.startTime))
          : existingSession?.startTime ?? new Date(String(data.startDate ?? existing.startDate));
        let endTime = session.endTime !== undefined
          ? new Date(String(session.endTime))
          : existingSession?.endTime ?? new Date(String(data.endDate ?? existing.endDate));
        if (!existingSession && session.endTime === undefined && endTime <= startTime) {
          endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        }
        const sessionData = {
          title: session.title.trim(),
          description: typeof session.description === 'string' ? session.description : existingSession?.description ?? null,
          room: typeof session.room === 'string' ? session.room : existingSession?.room ?? null,
          startTime,
          endTime,
          speakerId: typeof session.speakerId === 'string'
            ? speakerIdMap.get(session.speakerId) ?? null
            : existingSession?.speakerId ?? null,
        };
        if (existingSession) {
          await prisma.session.update({ where: { id: existingSession.id }, data: sessionData });
        } else {
          await prisma.session.create({ data: { ...sessionData, eventId: id } });
        }
      }
    }

    await prisma.event.update({ where: { id }, data: data as Prisma.EventUpdateManyMutationInput });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTiers: true, speakers: true, sessions: true },
  });
  return NextResponse.json({ event });
}