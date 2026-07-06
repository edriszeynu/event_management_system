import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '../_auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: any = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        organizer: { select: { firstName: true, lastName: true, email: true } },
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
    category: e.category,
    eventType: e.eventType,
    startDate: e.startDate.toISOString(),
    organizer: e.organizer,
    registrationsCount: e._count.registrations,
    revenue: e.ticketTiers.reduce((s, t) => s + t.price * t.quantitySold, 0),
  }));

  return NextResponse.json({ events: formatted, total });
}
