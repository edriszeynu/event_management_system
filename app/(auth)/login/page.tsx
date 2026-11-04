'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/auth';
import { loginAction } from '@/app/actions/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);

        const result = await loginAction(formData);

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.user) {
          login({ ...result.user, avatar: result.user.avatar ?? undefined });
          router.push('/');
        }
      } catch {
        setError('Unable to sign in right now. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Good to see you again."
      description="Sign in to find your next event and pick up where you left off."
      footer={
        <>
          New to EventHub?{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80">
            Create an account
          </Link>
        </>
      }
    >
      <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <span className="size-1.5 rounded-full bg-destructive" />
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">Email address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-lg border-input bg-background pl-10 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                    {...field}
                    disabled={isPending || isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 rounded-lg border-input bg-background pl-10 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                    {...field}
                    disabled={isPending || isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-12 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
          disabled={isPending || isLoading}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign in <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </Form>
    </AuthShell>
  );
}