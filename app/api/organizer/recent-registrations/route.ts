import { NextResponse } from 'next/server';
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

export async function GET() {
  const organizerId = await getOrganizerFromCookie();
  if (!organizerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: { event: { organizerId } },
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
