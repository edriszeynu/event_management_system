import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getOrganizerFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { id } = JSON.parse(Buffer.from(token, 'base64').toString());
    return id as string;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const organizerId = await getOrganizerFromCookie();
  if (!organizerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: any = { organizerId };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;

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
