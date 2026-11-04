"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, CalendarDays, History, Bell, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import Link from "next/link";

interface Stats {
  totalTickets: number;
  upcomingEvents: number;
  pastEvents: number;
  pendingNotifications: number;
}

export default function AttendeeDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendee/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { 
      label: "Total Tickets", 
      value: stats?.totalTickets ?? 0, 
      icon: Ticket, 
      href: "/attendee/tickets", 
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    { 
      label: "Upcoming Events", 
      value: stats?.upcomingEvents ?? 0, 
      icon: CalendarDays, 
      href: "/attendee/tickets", 
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    { 
      label: "Past Events", 
      value: stats?.pastEvents ?? 0, 
      icon: History, 
      href: "/attendee/history", 
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10"
    },
    { 
      label: "Notifications", 
      value: stats?.pendingNotifications ?? 0, 
      icon: Bell, 
      href: "/attendee/notifications", 
      gradient: "from-orange-500 to-yellow-500",
      bgGradient: "from-orange-500/10 to-yellow-500/10"
    },
  ];

  const quickActions = [
    { href: "/attendee/tickets", label: "View My Tickets", icon: Ticket },
    { href: "/attendee/history", label: "Event History", icon: History },
    { href: "/attendee/profile", label: "Edit Profile", icon: TrendingUp },
    { href: "/", label: "Browse Events", icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl font-bold">{user?.firstName?.[0]}</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-white/80 text-sm md:text-base mt-1">Let's explore what's happening today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <Link key={card.label} href={card.href}>
            <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${card.bgGradient}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl" style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {loading ? (
                  <div className="h-10 w-20 bg-muted/50 animate-pulse rounded-lg" />
                ) : (
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold bg-gradient-to-br bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to bottom right, ${card.gradient.split(' ').slice(1).join(' ')})` }}>{card.value}</p>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/20 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 group transition-all"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1 text-left font-medium">{action.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Activity Overview */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/20 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Events Attended</span>
                    <span className="font-semibold">{stats?.pastEvents ?? 0} total</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats?.pastEvents ?? 0) * 10, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Upcoming Events</span>
                    <span className="font-semibold">{stats?.upcomingEvents ?? 0} scheduled</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats?.upcomingEvents ?? 0) * 15, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-4 border-t">
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 transition-all">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Discover New Events
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
