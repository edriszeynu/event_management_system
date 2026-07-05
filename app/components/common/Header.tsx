'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { logoutAction } from '@/app/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/common/ModeToggle'; // 👈 import

export const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push('/');
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
        >
          <CalendarDays className="w-6 h-6 text-primary" />
          EventHub
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
            About
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full hover:bg-primary/10 inline-flex items-center justify-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" className="cursor-pointer" />}>
                  Profile
                </DropdownMenuItem>
                {user?.role === 'ORGANIZER' && (
                  <DropdownMenuItem render={<Link href="/organizer/dashboard" className="cursor-pointer" />}>
                    Dashboard
                  </DropdownMenuItem>
                )}
                {user?.role === 'SUPER_ADMIN' && (
                  <DropdownMenuItem render={<Link href="/admin" className="cursor-pointer" />}>
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-foreground/70 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}

          <ModeToggle /> {/* 👈 Add the theme toggle */}
        </nav>
      </div>
    </header>
  );
};