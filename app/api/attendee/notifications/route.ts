import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(['ATTENDEE']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(notifications.map((n) => ({
    ...n,
    sentAt: n.sentAt.toISOString(),
    deliveredAt: n.deliveredAt?.toISOString() ?? null,
  })));
}
