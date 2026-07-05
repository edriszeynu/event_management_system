import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---------- Categories ----------
  const categoryData = [
    { name: 'Technology', slug: 'tech', icon: '💻', description: 'Tech conferences and workshops' },
    { name: 'Music', slug: 'music', icon: '🎵', description: 'Concerts and festivals' },
    { name: 'Business', slug: 'business', icon: '💼', description: 'Networking and startups' },
    { name: 'Health', slug: 'health', icon: '🏥', description: 'Wellness and fitness' },
    { name: 'Education', slug: 'education', icon: '📚', description: 'Learning and development' },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // ---------- Organizer Users ----------
  const organizers = [
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' },
    { firstName: 'Mike', lastName: 'Chen', email: 'mike@example.com' },
    { firstName: 'Sara', lastName: 'Lee', email: 'sara@example.com' },
    { firstName: 'Tom', lastName: 'Brown', email: 'tom@example.com' },
  ];

  const passwordHash = await bcrypt.hash('password123', 12);
  const createdOrganizers: Record<string, string> = {};

  for (const org of organizers) {
    const user = await prisma.user.upsert({
      where: { email: org.email },
      update: {},
      create: { ...org, passwordHash, role: 'ORGANIZER' },
    });
    createdOrganizers[org.email] = user.id;
  }
  console.log('✅ Organizers seeded');

  // ---------- Events ----------
  const eventsData = [
    {
      title: 'Tech Summit 2026',
      slug: 'tech-summit-2026',
      description: 'The biggest tech conference of the year featuring AI, Cloud, and DevOps experts.',
      category: 'Technology',
      tags: ['AI', 'Cloud', 'DevOps'],
      eventType: 'HYBRID' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-08-15T09:00:00Z'),
      endDate: new Date('2026-08-15T18:00:00Z'),
      venueAddress: 'San Francisco Convention Center, CA',
      virtualLink: 'https://zoom.us/techsummit',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      maxCapacity: 500,
      organizerEmail: 'john@example.com',
      tiers: [
        { name: 'Early Bird', price: 49.99, quantityTotal: 100, quantitySold: 45, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-07-01') },
        { name: 'VIP', price: 199.99, quantityTotal: 20, quantitySold: 12, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-08-14') },
      ],
    },
    {
      title: 'Music Festival 2026',
      slug: 'music-fest-2026',
      description: 'An unforgettable weekend of live music, food, and art.',
      category: 'Music',
      tags: ['Live', 'Outdoor'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-09-20T12:00:00Z'),
      endDate: new Date('2026-09-22T23:00:00Z'),
      venueAddress: 'Central Park, NYC',
      bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      maxCapacity: 5000,
      organizerEmail: 'jane@example.com',
      tiers: [
        { name: 'General Admission', price: 89.99, quantityTotal: 500, quantitySold: 320, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-09-19') },
        { name: 'VIP Backstage', price: 249.99, quantityTotal: 30, quantitySold: 18, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-09-19') },
      ],
    },
    {
      title: 'Startup Pitch Night',
      slug: 'startup-pitch-night',
      description: 'Watch 10 startups pitch their ideas to top investors.',
      category: 'Business',
      tags: ['Startup', 'Networking'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-07-10T18:00:00Z'),
      endDate: new Date('2026-07-10T22:00:00Z'),
      venueAddress: 'WeWork, NYC',
      bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      maxCapacity: 100,
      organizerEmail: 'alice@example.com',
      tiers: [
        { name: 'General', price: 15.00, quantityTotal: 100, quantitySold: 62, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-07-09') },
      ],
    },
    {
      title: 'AI Workshop: Build Your First Model',
      slug: 'ai-workshop',
      description: 'Hands-on workshop to build and deploy a machine learning model.',
      category: 'Technology',
      tags: ['AI', 'Workshop'],
      eventType: 'VIRTUAL' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-08-20T14:00:00Z'),
      endDate: new Date('2026-08-20T17:00:00Z'),
      virtualLink: 'https://meet.google.com/abc-def',
      bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      maxCapacity: 50,
      organizerEmail: 'mike@example.com',
      tiers: [
        { name: 'Standard', price: 0, quantityTotal: 50, quantitySold: 48, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-08-19') },
      ],
    },
    {
      title: 'Health & Wellness Expo',
      slug: 'wellness-expo',
      description: 'Explore the latest in health, fitness, and mindfulness.',
      category: 'Health',
      tags: ['Health', 'Wellness'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-10-05T10:00:00Z'),
      endDate: new Date('2026-10-05T18:00:00Z'),
      venueAddress: 'Convention Center, LA',
      bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      maxCapacity: 200,
      organizerEmail: 'sara@example.com',
      tiers: [
        { name: 'General', price: 25.00, quantityTotal: 200, quantitySold: 134, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-10-04') },
      ],
    },
    {
      title: 'Digital Marketing Masterclass',
      slug: 'marketing-masterclass',
      description: 'Learn SEO, social media, and content marketing from experts.',
      category: 'Business',
      tags: ['Marketing', 'Digital'],
      eventType: 'VIRTUAL' as const,
      status: 'PUBLISHED' as const,
      startDate: new Date('2026-09-01T15:00:00Z'),
      endDate: new Date('2026-09-01T18:00:00Z'),
      virtualLink: 'https://zoom.us/marketing',
      bannerImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      maxCapacity: 130,
      organizerEmail: 'tom@example.com',
      tiers: [
        { name: 'Early Bird', price: 39.99, quantityTotal: 80, quantitySold: 55, salesStart: new Date('2026-01-01'), salesEnd: new Date('2026-07-31') },
        { name: 'Regular', price: 59.99, quantityTotal: 50, quantitySold: 30, salesStart: new Date('2026-08-01'), salesEnd: new Date('2026-08-31') },
      ],
    },
  ];

  for (const eventData of eventsData) {
    const { tiers, organizerEmail, ...rest } = eventData;
    const organizerId = createdOrganizers[organizerEmail];

    const event = await prisma.event.upsert({
      where: { slug: rest.slug },
      update: {},
      create: { ...rest, organizerId },
    });

    for (const tier of tiers) {
      const existing = await prisma.ticketTier.findFirst({
        where: { eventId: event.id, name: tier.name },
      });
      if (!existing) {
        await prisma.ticketTier.create({
          data: { ...tier, eventId: event.id },
        });
      }
    }
  }
  console.log('✅ Events seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
