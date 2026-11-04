import { Hero } from '@/components/landing/Hero';
import { Categories } from '@/components/landing/Categories';
import { FeaturedEvents } from '@/components/landing/FeaturedEvents';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { Footer } from '@/components/landing/Footer';

async function getEvents() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
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
