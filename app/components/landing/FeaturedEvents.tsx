import { EventCard } from '@/components/features/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Event } from '@/lib/types';

export const FeaturedEvents = ({ events }: { events: Event[] }) => {
  const featured = events.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Featured Events</h2>
        <Link href="/events">
          <Button variant="outline" className="rounded-full border-primary/40 text-primary hover:bg-primary/10">
            View All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
