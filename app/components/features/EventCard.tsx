import Link from 'next/link';
import { Event } from '@/lib/types';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const EventCard = ({ event }: { event: Event }) => {
  return (
    <Link href={`/events/${event.slug}`}>
      <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 border border-border transition-all duration-300 cursor-pointer">
        <div className="relative h-48 w-full">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {event.eventType}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{event.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{event.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.startDate), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.eventType === 'VIRTUAL' ? 'Online' : 'Venue'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.registrationsCount}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-primary font-semibold">
              From ${Math.min(...event.ticketTiers.map(t => t.price))}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {event.ticketTiers.reduce((a, t) => a + t.quantitySold, 0)} sold
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
