import { events } from '@/data/events';
import { EventCard } from '@/components/features/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const FeaturedEvents = () => {
  const featured = events.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
        <Link href="/events">
          <Button variant="outline" className="rounded-full">View All</Button>
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