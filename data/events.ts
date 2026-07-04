export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  eventType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  startDate: string;
  endDate: string;
  venueAddress?: string;
  virtualLink?: string;
  bannerImage: string;
  organizer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketTiers: TicketTier[];
  registrationsCount: number;
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Tech Summit 2026',
    slug: 'tech-summit-2026',
    description: 'The biggest tech conference of the year featuring AI, Cloud, and DevOps experts.',
    category: 'Technology',
    tags: ['AI', 'Cloud', 'DevOps'],
    eventType: 'HYBRID',
    startDate: '2026-08-15T09:00:00Z',
    endDate: '2026-08-15T18:00:00Z',
    venueAddress: 'San Francisco Convention Center, CA',
    virtualLink: 'https://zoom.us/techsummit',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    organizer: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    ticketTiers: [
      { id: 't1', name: 'Early Bird', price: 49.99, quantityTotal: 100, quantitySold: 45 },
      { id: 't2', name: 'VIP', price: 199.99, quantityTotal: 20, quantitySold: 12 },
    ],
    registrationsCount: 57,
  },
  {
    id: '2',
    title: 'Music Festival 2026',
    slug: 'music-fest-2026',
    description: 'An unforgettable weekend of live music, food, and art.',
    category: 'Music',
    tags: ['Live', 'Outdoor'],
    eventType: 'PHYSICAL',
    startDate: '2026-09-20T12:00:00Z',
    endDate: '2026-09-22T23:00:00Z',
    venueAddress: 'Central Park, NYC',
    virtualLink: undefined,
    bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    organizer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    ticketTiers: [
      { id: 't3', name: 'General Admission', price: 89.99, quantityTotal: 500, quantitySold: 320 },
      { id: 't4', name: 'VIP Backstage', price: 249.99, quantityTotal: 30, quantitySold: 18 },
    ],
    registrationsCount: 338,
  },
  {
    id: '3',
    title: 'Startup Pitch Night',
    slug: 'startup-pitch-night',
    description: 'Watch 10 startups pitch their ideas to top investors.',
    category: 'Business',
    tags: ['Startup', 'Networking'],
    eventType: 'PHYSICAL',
    startDate: '2026-07-10T18:00:00Z',
    endDate: '2026-07-10T22:00:00Z',
    venueAddress: 'WeWork, NYC',
    virtualLink: undefined,
    bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    organizer: { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' },
    ticketTiers: [
      { id: 't5', name: 'General', price: 15.00, quantityTotal: 100, quantitySold: 62 },
    ],
    registrationsCount: 62,
  },
  {
    id: '4',
    title: 'AI Workshop: Build Your First Model',
    slug: 'ai-workshop',
    description: 'Hands-on workshop to build and deploy a machine learning model.',
    category: 'Technology',
    tags: ['AI', 'Workshop'],
    eventType: 'VIRTUAL',
    startDate: '2026-08-20T14:00:00Z',
    endDate: '2026-08-20T17:00:00Z',
    virtualLink: 'https://meet.google.com/abc-def',
    bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    organizer: { firstName: 'Mike', lastName: 'Chen', email: 'mike@example.com' },
    ticketTiers: [
      { id: 't6', name: 'Standard', price: 0, quantityTotal: 50, quantitySold: 48 },
    ],
    registrationsCount: 48,
  },
  {
    id: '5',
    title: 'Health & Wellness Expo',
    slug: 'wellness-expo',
    description: 'Explore the latest in health, fitness, and mindfulness.',
    category: 'Health',
    tags: ['Health', 'Wellness'],
    eventType: 'PHYSICAL',
    startDate: '2026-10-05T10:00:00Z',
    endDate: '2026-10-05T18:00:00Z',
    venueAddress: 'Convention Center, LA',
    virtualLink: undefined,
    bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    organizer: { firstName: 'Sara', lastName: 'Lee', email: 'sara@example.com' },
    ticketTiers: [
      { id: 't7', name: 'General', price: 25.00, quantityTotal: 200, quantitySold: 134 },
    ],
    registrationsCount: 134,
  },
  {
    id: '6',
    title: 'Digital Marketing Masterclass',
    slug: 'marketing-masterclass',
    description: 'Learn SEO, social media, and content marketing from experts.',
    category: 'Business',
    tags: ['Marketing', 'Digital'],
    eventType: 'VIRTUAL',
    startDate: '2026-09-01T15:00:00Z',
    endDate: '2026-09-01T18:00:00Z',
    virtualLink: 'https://zoom.us/marketing',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    organizer: { firstName: 'Tom', lastName: 'Brown', email: 'tom@example.com' },
    ticketTiers: [
      { id: 't8', name: 'Early Bird', price: 39.99, quantityTotal: 80, quantitySold: 55 },
      { id: 't9', name: 'Regular', price: 59.99, quantityTotal: 50, quantitySold: 30 },
    ],
    registrationsCount: 85,
  },
];