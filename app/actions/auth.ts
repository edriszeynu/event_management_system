'use server';

import { cookies } from 'next/headers';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) return { error: result.error.errors[0].message };

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Invalid credentials' };
    return { user: data.user };
  } catch {
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
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Registration failed' };
    return { user: data.user };
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
