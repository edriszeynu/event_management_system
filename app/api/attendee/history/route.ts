import { NextResponse } from 'next/server';
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

export async function GET() {
  const userId = await getUserFromCookie();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: {
      userId,
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
