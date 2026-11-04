'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/auth';
import { registerAction } from '@/app/actions/auth';
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
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    setLoading(true);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('confirmPassword', data.confirmPassword);

        const result = await registerAction(formData);

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.user) {
          router.push('/login');
        }
      } catch {
        setError('Unable to create your account right now. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Join EventHub"
      title="Make room for more."
      description="Create your account and discover experiences worth showing up for."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
            Sign in
          </Link>
        </>
      }
    >
      <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <span className="size-1.5 rounded-full bg-destructive" />
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">First name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="given-name"
                      placeholder="Jordan"
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Last name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="family-name"
                    placeholder="Lee"
                    className="h-12 rounded-lg border-input bg-background px-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20"
                    {...field}
                    disabled={isPending || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
              <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">Confirm password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
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
          className="mt-1 h-12 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
          disabled={isPending || isLoading}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create account <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </Form>
    </AuthShell>
  );
}