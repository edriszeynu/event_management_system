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
    { firstName: 'Admin', lastName: 'User', email: 'admin@eventhub.com', role: 'SUPER_ADMIN' as const },
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ORGANIZER' as const },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'ORGANIZER' as const },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'ORGANIZER' as const },
    { firstName: 'Mike', lastName: 'Chen', email: 'mike@example.com', role: 'ORGANIZER' as const },
    { firstName: 'Sara', lastName: 'Lee', email: 'sara@example.com', role: 'ORGANIZER' as const },
    { firstName: 'Tom', lastName: 'Brown', email: 'tom@example.com', role: 'ORGANIZER' as const },
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

  // ---------- Super Admin ----------
  const superAdminEmail = 'admin@eventhub.com';
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
  const eventsData = [
    // ... (your existing events array, unchanged)
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