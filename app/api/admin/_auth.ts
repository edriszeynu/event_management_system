import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { id } = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'SUPER_ADMIN') return null;
    return user;
  } catch {
    return null;
  }
}
