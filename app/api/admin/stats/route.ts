import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '../_auth';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [users, events, registrations, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.ticketTier.aggregate({ _sum: { price: true } }),
  ]);

  return NextResponse.json({
    totalUsers: users,
    totalEvents: events,
    totalRegistrations: registrations,
    totalRevenue: revenue._sum.price ?? 0,
  });
}
