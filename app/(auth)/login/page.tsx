'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/auth';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

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
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.user) {
        login(result.user);
        router.push('/');
      }
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md border border-border/50 shadow-2xl shadow-primary/5 rounded-3xl bg-card">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <LogIn className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </CardHeader>
        <CardContent>
          <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9 h-11 rounded-xl border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-11 rounded-xl border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          {...field}
                          disabled={isPending || isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                size="lg"
                disabled={isPending || isLoading}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="ml-1 text-primary hover:underline font-medium"
          >
            Create one
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}