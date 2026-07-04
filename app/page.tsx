import { Hero } from '@/components/landing/Hero';
import { Categories } from '@/components/landing/Categories';
import { FeaturedEvents } from '@/components/landing/FeaturedEvents';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedEvents />
      <HowItWorks />
      <Stats />
      <Footer />
    </>
  );
}