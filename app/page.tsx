import { Hero } from '@/components/landing/Hero';
import { Categories } from '@/components/landing/Categories';
import { FeaturedEvents } from '@/components/landing/FeaturedEvents';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { Footer } from '@/components/landing/Footer';
import prisma from '@/lib/prisma';

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
        ticketTiers: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      category: e.category,
      tags: e.tags,
      eventType: e.eventType,
      status: e.status,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      venueAddress: e.venueAddress ?? undefined,
      virtualLink: e.virtualLink ?? undefined,
      bannerImage: e.bannerImage ?? undefined,
      maxCapacity: e.maxCapacity,
      organizer: e.organizer,
      ticketTiers: e.ticketTiers.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        quantityTotal: t.quantityTotal,
        quantitySold: t.quantitySold,
        salesStart: t.salesStart.toISOString(),
        salesEnd: t.salesEnd.toISOString(),
        status: t.status,
        description: t.description ?? undefined,
      })),
      registrationsCount: e._count.registrations,
    }));
  } catch (err) {
    console.error('[Home] getEvents failed:', err);
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();

  return (
    <main>
      <Hero />
      <Categories />
      <FeaturedEvents events={events} />
      <HowItWorks />
      <Stats />
      <Footer />
    </main>
  );
}
