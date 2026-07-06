import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const where: any = { eventId: event.id };
  if (status) where.status = status;
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
