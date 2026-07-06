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

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(notifications.map((n) => ({
    ...n,
    sentAt: n.sentAt.toISOString(),
    deliveredAt: n.deliveredAt?.toISOString() ?? null,
  })));
}
