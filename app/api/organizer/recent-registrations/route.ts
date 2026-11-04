import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const organizer = await getAuthenticatedUser(['ORGANIZER']);
  if (!organizer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: { event: { organizerId: organizer.id } },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      event: { select: { title: true } },
      ticketTier: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json(
    registrations.map((r) => ({
      id: r.id,
      user: r.user,
      event: r.event,
      ticketTier: r.ticketTier,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
