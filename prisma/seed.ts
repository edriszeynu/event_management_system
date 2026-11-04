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
    { firstName: 'Admin', lastName: 'User', email: 'admin@gmail.com', role: 'SUPER_ADMIN' as const },
    { firstName: 'John', lastName: 'Doe', email: 'john@gmail.com', role: 'ORGANIZER' as const },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@gmail.com', role: 'ORGANIZER' as const },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice@gmail.com', role: 'ORGANIZER' as const },
    { firstName: 'Mike', lastName: 'Chen', email: 'mike@gmail.com', role: 'ORGANIZER' as const },
    { firstName: 'Sara', lastName: 'Lee', email: 'sara@gmail.com', role: 'ORGANIZER' as const },
    { firstName: 'Tom', lastName: 'Brown', email: 'tom@gmail.com', role: 'ORGANIZER' as const },
  ];

  const passwordHash = await bcrypt.hash('password123', 12);
  const createdOrganizers: Record<string, string> = {};

  for (const org of organizers) {
    const user = await prisma.user.upsert({
      where: { email: org.email },
      update: {},
      create: { ...org, passwordHash, role: org.role },
    });
    createdOrganizers[org.email] = user.id;
  }
  console.log('✅ Organizers seeded');

  // ---------- Attendee and Speaker Users ----------
  const additionalUsers = [
    { firstName: 'Alex', lastName: 'Attendee', email: 'attendee@gmail.com', role: 'ATTENDEE' as const },
    { firstName: 'Sam', lastName: 'Speaker', email: 'speaker@gmail.com', role: 'SPEAKER' as const },
  ];

  for (const user of additionalUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }
  console.log('✅ Attendee and speaker users seeded');

  // ---------- Super Admin ----------
  const superAdminEmail = 'admin@gmail.com';
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: await bcrypt.hash('Admin123!', 12),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Super Admin created');
  } else {
    console.log('ℹ️ Super Admin already exists');
  }

  // ---------- Events ----------
  const dateFromNow = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const eventsData = [
    {
      title: 'Northstar Product & Innovation Summit',
      slug: 'northstar-product-innovation-summit',
      description: 'A practical day for product leaders, designers, and founders to share how they turn customer insight into products people love. Expect candid talks, useful frameworks, and time to meet your next collaborator.',
      category: 'Technology',
      tags: ['product', 'design', 'startups'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: dateFromNow(24, 9),
      endDate: dateFromNow(24, 17),
      timezone: 'America/New_York',
      venueAddress: 'The Glasshouse, 660 12th Avenue, New York, NY',
      maxCapacity: 320,
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=85',
      organizerEmail: 'john@gmail.com',
      tiers: [
        { name: 'General Admission', description: 'Full-day access, refreshments, and networking.', price: 89, quantityTotal: 260, quantitySold: 42, salesStart: dateFromNow(-10, 9), salesEnd: dateFromNow(23, 23), status: 'ACTIVE' as const },
        { name: 'Community Ticket', description: 'Discounted admission for students and nonprofit teams.', price: 39, quantityTotal: 60, quantitySold: 18, salesStart: dateFromNow(-10, 9), salesEnd: dateFromNow(23, 23), status: 'ACTIVE' as const },
      ],
    },
    {
      title: 'City Lights: An Evening of Live Jazz',
      slug: 'city-lights-live-jazz-evening',
      description: 'Settle in for an intimate night of modern jazz led by the Maya Rivera Quartet. Doors open early for a relaxed lounge set, followed by original compositions and reimagined classics in a beautiful downtown room.',
      category: 'Music',
      tags: ['live music', 'jazz', 'evening'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: dateFromNow(18, 19),
      endDate: dateFromNow(18, 22),
      timezone: 'America/Los_Angeles',
      venueAddress: 'The Wiltern, 3790 Wilshire Boulevard, Los Angeles, CA',
      maxCapacity: 480,
      bannerImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=85',
      organizerEmail: 'jane@gmail.com',
      tiers: [
        { name: 'Standard', description: 'Reserved general seating.', price: 32, quantityTotal: 380, quantitySold: 106, salesStart: dateFromNow(-14, 9), salesEnd: dateFromNow(17, 23), status: 'ACTIVE' as const },
        { name: 'Front Row', description: 'Premium seating near the stage.', price: 58, quantityTotal: 100, quantitySold: 57, salesStart: dateFromNow(-14, 9), salesEnd: dateFromNow(17, 23), status: 'ACTIVE' as const },
      ],
    },
    {
      title: 'Build for Good: Community Design Workshop',
      slug: 'build-for-good-community-design-workshop',
      description: 'Work in small teams to rethink a real community challenge with human-centered design. Facilitators will guide you from research and brainstorming through a simple prototype you can share with local partners.',
      category: 'Education',
      tags: ['design', 'community', 'workshop'],
      eventType: 'HYBRID' as const,
      status: 'PUBLISHED' as const,
      startDate: dateFromNow(31, 10),
      endDate: dateFromNow(31, 16),
      timezone: 'America/Chicago',
      venueAddress: 'The Hatchery, 135 N Kedzie Avenue, Chicago, IL',
      virtualLink: 'https://example.com/build-for-good',
      maxCapacity: 120,
      bannerImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&q=85',
      organizerEmail: 'alice@gmail.com',
      tiers: [
        { name: 'In-person Pass', description: 'Workshop materials, lunch, and venue access.', price: 45, quantityTotal: 80, quantitySold: 21, salesStart: dateFromNow(-7, 9), salesEnd: dateFromNow(30, 23), status: 'ACTIVE' as const },
        { name: 'Online Pass', description: 'Live stream access and digital workshop kit.', price: 19, quantityTotal: 40, quantitySold: 9, salesStart: dateFromNow(-7, 9), salesEnd: dateFromNow(30, 23), status: 'ACTIVE' as const },
      ],
    },
    {
      title: 'Founders Table: Honest Conversations About Growth',
      slug: 'founders-table-growth-conversations',
      description: 'A welcoming evening for early-stage founders to compare notes on hiring, finding product-market fit, and building a sustainable business. Short opening stories lead into small-group conversations with no pitches and no pressure.',
      category: 'Business',
      tags: ['founders', 'networking', 'business'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: dateFromNow(12, 18),
      endDate: dateFromNow(12, 21),
      timezone: 'America/New_York',
      venueAddress: 'Brooklyn Made, 428 Troutman Street, Brooklyn, NY',
      maxCapacity: 90,
      bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=85',
      organizerEmail: 'mike@gmail.com',
      tiers: [
        { name: 'Founder Seat', description: 'Admission and light dinner.', price: 24, quantityTotal: 90, quantitySold: 33, salesStart: dateFromNow(-12, 9), salesEnd: dateFromNow(11, 23), status: 'ACTIVE' as const },
      ],
    },
    {
      title: 'Sunday Reset: Outdoor Yoga & Breathwork',
      slug: 'sunday-reset-outdoor-yoga-breathwork',
      description: 'Make space to slow down with an all-levels outdoor yoga flow, guided breathwork, and a quiet closing meditation. Bring a mat, water, and anything that helps you feel comfortable outdoors.',
      category: 'Health',
      tags: ['wellness', 'yoga', 'outdoors'],
      eventType: 'PHYSICAL' as const,
      status: 'PUBLISHED' as const,
      startDate: dateFromNow(9, 9),
      endDate: dateFromNow(9, 11),
      timezone: 'America/Los_Angeles',
      venueAddress: 'Griffith Park, 4730 Crystal Springs Drive, Los Angeles, CA',
      maxCapacity: 70,
      bannerImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=85',
      organizerEmail: 'sara@gmail.com',
      tiers: [
        { name: 'Morning Pass', description: 'Outdoor session and herbal tea after class.', price: 18, quantityTotal: 70, quantitySold: 26, salesStart: dateFromNow(-5, 9), salesEnd: dateFromNow(8, 23), status: 'ACTIVE' as const },
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