export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  salesStart?: string;
  salesEnd?: string;
  status?: string;
}

export interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatar?: string;
  bio?: string;
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
  speaker?: Speaker;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  eventType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  status?: string;
  startDate: string;
  endDate: string;
  venueAddress?: string;
  virtualLink?: string;
  bannerImage?: string;
  maxCapacity?: number;
  organizer: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketTiers: TicketTier[];
  sessions?: Session[];
  speakers?: Speaker[];
  registrationsCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}
