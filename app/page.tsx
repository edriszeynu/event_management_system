import { Hero } from '@/components/landing/Hero';
import { Categories } from '@/components/landing/Categories';
import { FeaturedEvents } from '@/components/landing/FeaturedEvents';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { Footer } from '@/components/landing/Footer';

async function getEvents() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
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
