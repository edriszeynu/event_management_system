import { NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(['ORGANIZER', 'SUPER_ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
  }

  const ownershipFilter = user.role === 'SUPER_ADMIN' ? {} : { organizerId: user.id };
  const event = await prisma.event.findFirst({
    where: { id, ...ownershipFilter },
    include: { ticketTiers: { select: { name: true, price: true, quantitySold: true } } },
  });
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    select: { createdAt: true, status: true, ticketTier: { select: { name: true, price: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const revenueStatuses = new Set(['CONFIRMED', 'CHECKED_IN']);
  const paidRegistrations = registrations.filter((registration) => revenueStatuses.has(registration.status));
  const totalRevenue = paidRegistrations.reduce((total, registration) => total + registration.ticketTier.price, 0);
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter((registration) => registration.status === 'CHECKED_IN').length;

  const registrationsByDay: Record<string, number> = {};
  const revenueByDay: Record<string, number> = {};
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const day = format(subDays(new Date(), daysAgo), 'MMM d');
    registrationsByDay[day] = 0;
    revenueByDay[day] = 0;
  }
  for (const registration of registrations) {
    const day = format(registration.createdAt, 'MMM d');
    if (day in registrationsByDay) registrationsByDay[day]++;
    if (day in revenueByDay && revenueStatuses.has(registration.status)) {
      revenueByDay[day] += registration.ticketTier.price;
    }
  }

  return NextResponse.json({
    totalRegistrations,
    revenue: totalRevenue,
    checkInRate: totalRegistrations ? Math.round((checkedInCount / totalRegistrations) * 100) : 0,
    avgTicketPrice: paidRegistrations.length ? totalRevenue / paidRegistrations.length : 0,
    registrationsOverTime: Object.entries(registrationsByDay).map(([date, count]) => ({ date, registrations: count })),
    ticketDistribution: event.ticketTiers.map((tier) => ({ name: tier.name, value: tier.quantitySold })),
    revenueOverTime: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
  });
}
