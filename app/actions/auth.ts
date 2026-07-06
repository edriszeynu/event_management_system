'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

function makeToken(id: string, email: string) {
  return Buffer.from(JSON.stringify({ id, email })).toString('base64');
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) return { error: result.error.errors[0].message };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return { error: 'Invalid credentials' };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { error: 'Invalid credentials' };

    const cookieStore = await cookies();
    cookieStore.set('auth-token', makeToken(user.id, user.email), COOKIE_OPTS);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    };
  } catch (e) {
    console.error('Login error:', e);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function registerAction(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = registerSchema.safeParse({ firstName, lastName, email, password, confirmPassword });
  if (!result.success) return { error: result.error.errors[0].message };

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: 'Email already in use' };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true },
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', makeToken(user.id, user.email), COOKIE_OPTS);

    return { user };
  } catch (e) {
    console.error('Register error:', e);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
