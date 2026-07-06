import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { id } = JSON.parse(Buffer.from(token, 'base64').toString());
    return id as string;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await getUserFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const upcoming = req.nextUrl.searchParams.get('upcoming') === 'true';
  const now = new Date();

  const registrations = await prisma.registration.findMany({
    where: {
      userId,
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
