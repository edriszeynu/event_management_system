export async function getEvents() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}
