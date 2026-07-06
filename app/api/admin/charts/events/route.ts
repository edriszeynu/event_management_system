import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '../../_auth';
import { format, subDays } from 'date-fns';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { createdAt: { gte: subDays(new Date(), 30) } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    grouped[format(subDays(new Date(), i), 'MMM d')] = 0;
  }
  for (const e of events) {
    const day = format(e.createdAt, 'MMM d');
    if (day in grouped) grouped[day]++;
  }

  return NextResponse.json(Object.entries(grouped).map(([date, events]) => ({ date, events })));
}
