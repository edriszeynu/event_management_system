import { events, Event } from '@/data/events';

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return events;
  },
  getBySlug: async (slug: string): Promise<Event | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return events.find((e) => e.slug === slug);
  },
};