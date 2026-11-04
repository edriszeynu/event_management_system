import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { Role } from '@prisma/client';
import prisma from '@/lib/prisma';

const SESSION_COOKIE = 'auth-token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.DATABASE_URL;
  if (!secret || secret.length < 32) {
    throw new Error('Set AUTH_SECRET to a secret of at least 32 characters');
  }
  return `event-management-session:${secret}`;
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token: string) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  try {
    const expected = Buffer.from(sign(payload), 'base64url');
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded) || !('exp' in decoded)) return null;
    if (typeof decoded.sub !== 'string' || typeof decoded.exp !== 'number' || decoded.exp <= Date.now() / 1000) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(allowedRoles?: Role[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let userId: string | null;
  try {
    userId = verifySessionToken(token);
  } catch {
    return null;
  }
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive || (allowedRoles && !allowedRoles.includes(user.role))) return null;
  return user;
}