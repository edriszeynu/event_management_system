import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
      ticketTiers: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  const formatted = events.map((e) => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    registrationsCount: e._count.registrations,
  }));

  return NextResponse.json(formatted);
}
