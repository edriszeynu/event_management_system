import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: {
      userId: user.id,
      event: { endDate: { lt: new Date() } },
    },
    include: {
      event: {
        select: {
          id: true, title: true, slug: true,
          startDate: true, endDate: true,
          category: true, eventType: true, bannerImage: true,
        },
      },
      ticketTier: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(registrations.map((r) => ({
    id: r.id,
    status: r.status,
    checkedInAt: r.checkedInAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    event: {
      ...r.event,
      startDate: r.event.startDate.toISOString(),
      endDate: r.event.endDate.toISOString(),
    },
    ticketTier: r.ticketTier,
  })));
}
