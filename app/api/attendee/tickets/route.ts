import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const upcoming = req.nextUrl.searchParams.get('upcoming') === 'true';
  const now = new Date();

  const registrations = await prisma.registration.findMany({
    where: {
      userId: user.id,
      ...(upcoming ? { event: { startDate: { gt: now } } } : {}),
    },
    include: {
      event: { select: { id: true, title: true, slug: true, startDate: true, endDate: true, eventType: true, bannerImage: true } },
      ticketTier: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(registrations.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    event: {
      ...r.event,
      startDate: r.event.startDate.toISOString(),
      endDate: r.event.endDate.toISOString(),
    },
    ticketTier: r.ticketTier,
  })));
}
