import { getAuthenticatedUser } from '@/lib/auth';

export async function requireAdmin() {
  return getAuthenticatedUser(['SUPER_ADMIN']);
}
