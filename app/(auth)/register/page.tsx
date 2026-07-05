'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/auth';
import { registerAction } from '@/app/actions/auth';
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
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
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
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);

      const result = await registerAction(formData);

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
              <UserPlus className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-muted-foreground">Join thousands of event enthusiasts</p>
        </CardHeader>
        <CardContent>
          <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="John"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-11 rounded-xl border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                size="lg"
                disabled={isPending || isLoading}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="ml-1 text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}