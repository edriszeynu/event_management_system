"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { logoutAction } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/common/ModeToggle";

export const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 shadow-sm shadow-foreground/3 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span>Event<span className="text-primary">Hub</span></span>
          </Link>

          <nav aria-label="Main navigation" className="hidden h-full items-center gap-1 md:flex">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground">
              Events
            </Link>
            <Link href="#" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground">
              About
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/cart"
              aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-border transition hover:ring-primary/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 font-semibold text-primary">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[290px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-0 shadow-2xl shadow-slate-950/60 backdrop-blur-xl sm:w-72">
                    <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-white/30">
                          <AvatarImage src={user?.avatar} alt={user?.firstName} />
                          <AvatarFallback className="bg-white/20 text-sm font-semibold text-white">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold">{user?.firstName} {user?.lastName}</p>
                          <p className="truncate text-xs text-white/80">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-2">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                        onClick={() => router.push("/attendee/profile")}
                      >
                        Profile
                      </DropdownMenuItem>
                      {user?.role === "ORGANIZER" && (
                        <DropdownMenuItem
                          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                          onClick={() => router.push("/organizer")}
                        >
                          Dashboard
                        </DropdownMenuItem>
                      )}
                      {user?.role === "SUPER_ADMIN" && (
                        <DropdownMenuItem
                          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                          onClick={() => router.push("/admin")}
                        >
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                        onClick={() => router.push("/attendee/tickets")}
                      >
                        My Tickets
                      </DropdownMenuItem>
                    </div>

                    <div className="border-t border-border/60 p-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                    Sign In
                  </Link>
                  <Link href="/register" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="hidden md:block">
              <ModeToggle />
            </div>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="border-t border-border/80 py-4 md:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                Events
              </Link>
              <Link href="#" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                About
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="my-2 border-t border-border/80" />
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <Link href="/attendee/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                    Profile
                  </Link>
                  {user?.role === "ORGANIZER" && (
                    <Link href="/organizer" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                      Dashboard
                    </Link>
                  )}
                  {user?.role === "SUPER_ADMIN" && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/attendee/tickets" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
                    My Tickets
                  </Link>
                  <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/80 pt-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    Get Started
                  </Link>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-border/80 px-3 pt-4">
                <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                <ModeToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};