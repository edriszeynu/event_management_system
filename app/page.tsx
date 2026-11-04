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
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      registrationsCount: e._count.registrations,
    }));
  } catch {
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
