#!/bin/bash

# Attendee Dashboard - Complete File Creator
# Run this from your project root (where 'app' and 'components' exist)

set -e

echo "🚀 Creating Attendee Dashboard structure..."

# -------- 1. Folders --------
mkdir -p app/attendee/tickets
mkdir -p app/attendee/profile
mkdir -p app/attendee/notifications
mkdir -p app/attendee/history
mkdir -p components/attendee
mkdir -p app/api/attendee/stats
mkdir -p app/api/attendee/tickets
mkdir -p app/api/attendee/profile
mkdir -p app/api/attendee/password
mkdir -p app/api/attendee/notifications
mkdir -p app/api/attendee/history
mkdir -p app/api/attendee/feedback

# -------- 2. Layout & Sidebar --------

cat > app/attendee/layout.tsx << 'EOF'
"use client";

import { useAuthStore } from "@/stores/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/attendee/Sidebar";
import { Header } from "@/components/organizer/Header";
import { MobileNav } from "@/components/organizer/MobileNav";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "ATTENDEE" && user?.role !== "SUPER_ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 2) return "Overview";
    const last = segments[segments.length - 1];
    if (last === "tickets") return "My Tickets";
    if (last === "profile") return "Profile";
    if (last === "notifications") return "Notifications";
    if (last === "history") return "Event History";
    return "Overview";
  };

  if (!isAuthenticated || (user?.role !== "ATTENDEE" && user?.role !== "SUPER_ADMIN")) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileNav open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={getPageTitle()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
EOF

cat > components/attendee/Sidebar.tsx << 'EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  User,
  Bell,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/attendee", icon: LayoutDashboard, label: "Overview" },
  { href: "/attendee/tickets", icon: Ticket, label: "My Tickets" },
  { href: "/attendee/profile", icon: User, label: "Profile" },
  { href: "/attendee/notifications", icon: Bell, label: "Notifications" },
  { href: "/attendee/history", icon: History, label: "Event History" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link href="/attendee" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Ticket className="h-6 w-6" />
          EventHub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Attendee Dashboard</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
EOF

# -------- 3. Dashboard Overview (Home) --------

cat > app/attendee/page.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/organizer/StatsCard";
import { Ticket, Calendar, History, Bell } from "lucide-react";
import { UpcomingEventsList } from "@/components/attendee/UpcomingEventsList";
import { NotificationList } from "@/components/attendee/NotificationList";
import { useToast } from "@/hooks/use-toast";

export default function AttendeeDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalTickets: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    pendingNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/attendee/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted animate-pulse rounded-xl" />
        <div className="h-80 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tickets"
          value={stats.totalTickets}
          icon={Ticket}
          trend="All time"
        />
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Calendar}
          trend="Next event soon"
        />
        <StatsCard
          title="Past Events"
          value={stats.pastEvents}
          icon={History}
          trend="Leave feedback"
        />
        <StatsCard
          title="Notifications"
          value={stats.pendingNotifications}
          icon={Bell}
          trend="Unread"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEventsList />
        <NotificationList />
      </div>
    </div>
  );
}
EOF

cat > components/attendee/UpcomingEventsList.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export function UpcomingEventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/attendee/tickets?upcoming=true");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load upcoming events", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No upcoming events</p>
          ) : (
            events.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{event.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event.startDate), "MMM d, yyyy")} · {event.ticketTier.name}
                  </p>
                </div>
                <Link href={`/events/${event.event.slug}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
EOF

cat > components/attendee/NotificationList.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/attendee/notifications?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No notifications</p>
          ) : (
            notifications.map((notif: any) => (
              <div key={notif.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{notif.subject}</p>
                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(notif.sentAt), "MMM d, yyyy")}</p>
                </div>
                <Badge variant={notif.isRead ? "secondary" : "default"}>
                  {notif.isRead ? "Read" : "Unread"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# -------- 4. My Tickets --------

cat > app/attendee/tickets/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { TicketCard } from "@/components/attendee/TicketCard";
import { useToast } from "@/hooks/use-toast";

export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/attendee/tickets");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [toast]);

  if (loading) {
    return <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't purchased any tickets yet.</p>
          <a href="/events" className="text-primary hover:underline">Browse events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
EOF

cat > components/attendee/TicketCard.tsx << 'EOF'
"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Download, Eye, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export function TicketCard({ ticket }: { ticket: any }) {
  const [showQR, setShowQR] = useState(false);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CHECKED_IN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{ticket.ticketTier.name}</p>
          </div>
          <Badge className={statusColors[ticket.status as keyof typeof statusColors] || "bg-gray-100"}>
            {ticket.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(ticket.event.startDate), "MMM d, yyyy · h:mm a")}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {ticket.event.eventType === "VIRTUAL" ? "Virtual" : ticket.event.venueAddress || "Venue TBA"}
        </div>
        <div className="flex justify-between text-sm">
          <span>Ticket ID: {ticket.id.slice(-8)}</span>
          <span>${ticket.ticketTier.price.toFixed(2)}</span>
        </div>
        {showQR && (
          <div className="flex justify-center py-4">
            <QRCodeSVG value={ticket.id} size={150} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
          {showQR ? "Hide QR" : "Show QR"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/events/${ticket.event.slug}`}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
EOF

# -------- 5. Profile Management --------

cat > app/attendee/profile/page.tsx << 'EOF'
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/attendee/ProfileForm";
import { PasswordForm } from "@/components/attendee/PasswordForm";
import { AvatarUpload } from "@/components/attendee/AvatarUpload";
import { useAuthStore } from "@/stores/auth";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <AvatarUpload currentAvatar={user?.avatar} />
            </div>
            <div className="md:col-span-2">
              <ProfileForm user={user} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
EOF

# Reuse the ProfileForm, PasswordForm, AvatarUpload from organizer? We'll create attendee versions (they are similar but can reuse if paths align)
# We'll just copy them from organizer or create new ones.

cat > components/attendee/ProfileForm.tsx << 'EOF'
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export function ProfileForm({ user }: any) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || "", lastName: user?.lastName || "" },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/attendee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast({ title: "Success", description: "Profile updated", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormItem><FormLabel>Email</FormLabel><Input value={user?.email} disabled /></FormItem>
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
EOF

cat > components/attendee/PasswordForm.tsx << 'EOF'
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Minimum 6 characters"),
  newPassword: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function PasswordForm() {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/attendee/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to change password");
      toast({ title: "Success", description: "Password changed", variant: "success" });
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="currentPassword" render={({ field }) => (
          <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="newPassword" render={({ field }) => (
          <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">Change Password</Button>
      </form>
    </Form>
  );
}
EOF

cat > components/attendee/AvatarUpload.tsx << 'EOF'
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AvatarUpload({ currentAvatar }: { currentAvatar?: string }) {
  const { toast } = useToast();
  const [avatar, setAvatar] = useState(currentAvatar);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate upload – replace with real upload logic
    toast({ title: "Upload", description: "Avatar upload will be implemented." });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          <Camera className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <label>
          <Camera className="h-4 w-4" />
          Change Avatar
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </Button>
    </div>
  );
}
EOF

# -------- 6. Notifications --------

cat > app/attendee/notifications/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/attendee/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/attendee/notifications/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark as read");
      fetchNotifications();
      toast({ title: "Marked as read", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch("/api/attendee/notifications/clear", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      fetchNotifications();
      toast({ title: "Cleared all notifications", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to clear", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearAll}>Clear All</Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif: any) => (
            <Card key={notif.id} className={notif.isRead ? "opacity-70" : "border-primary/20"}>
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex-1">
                  <p className="font-medium">{notif.subject}</p>
                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(notif.sentAt), "MMM d, yyyy HH:mm")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notif.id)}>Mark as read</Button>
                  )}
                  <Badge variant={notif.isRead ? "secondary" : "default"}>
                    {notif.isRead ? "Read" : "Unread"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

# -------- 7. Event History & Feedback --------

cat > app/attendee/history/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/attendee/FeedbackModal";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/attendee/history");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openFeedback = (event: any) => {
    setSelectedEvent(event);
    setFeedbackOpen(true);
  };

  if (loading) {
    return <div className="space-y-4">
      <h1 className="text-2xl font-bold">Event History</h1>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event History</h1>
      {history.length === 0 ? (
        <p className="text-muted-foreground">You haven't attended any events yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                <div>
                  <p className="font-medium">{event.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event.startDate), "MMM d, yyyy")} · {event.ticketTier.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {event.feedback ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{event.feedback.rating}/5</span>
                      {event.feedback.comment && (
                        <span className="text-sm text-muted-foreground ml-1">"{event.feedback.comment}"</span>
                      )}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openFeedback(event)}>
                      <MessageSquare className="h-4 w-4" /> Leave Feedback
                    </Button>
                  )}
                  <Badge variant="secondary">{event.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedEvent && (
        <FeedbackModal
          open={feedbackOpen}
          onOpenChange={setFeedbackOpen}
          event={selectedEvent}
          onRefresh={fetchHistory}
        />
      )}
    </div>
  );
}
EOF

cat > components/attendee/FeedbackModal.tsx << 'EOF'
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onRefresh: () => void;
}

export function FeedbackModal({ open, onOpenChange, event, onRefresh }: FeedbackModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Error", description: "Please select a rating", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/attendee/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      toast({ title: "Success", description: "Feedback submitted", variant: "success" });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
          <DialogDescription>
            Rate your experience for "{event.event.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hover || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating}/5` : "Select rating"}
            </span>
          </div>
          <Textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
EOF

# -------- 8. API Routes (simplified, to be expanded) --------

cat > app/api/attendee/stats/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth"; // adjust if you have a session helper
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get current user (assuming you have a helper)
    // This is a placeholder – replace with your actual auth logic
    const userId = "YOUR_USER_ID"; // placeholder
    // For production, extract from JWT token

    const [totalTickets, upcomingEvents, pastEvents, pendingNotifications] = await Promise.all([
      prisma.registration.count({ where: { userId, status: "CONFIRMED" } }),
      prisma.registration.count({
        where: { userId, event: { startDate: { gte: new Date() } } },
      }),
      prisma.registration.count({
        where: { userId, event: { startDate: { lt: new Date() } } },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      totalTickets,
      upcomingEvents,
      pastEvents,
      pendingNotifications,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
EOF

# Similar route stubs for others – we'll include them but simplify.

cat > app/api/attendee/tickets/route.ts << 'EOF'
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Replace with actual user ID from session
    const userId = "YOUR_USER_ID";
    const tickets = await prisma.registration.findMany({
      where: { userId },
      include: {
        event: true,
        ticketTier: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
EOF

# The other API routes (profile, password, notifications, history, feedback) follow the same pattern.
# We'll include them as placeholders.

for endpoint in profile password notifications history feedback; do
  cat > app/api/attendee/$endpoint/route.ts << EOF
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "${endpoint} endpoint" });
}
export async function POST() {
  return NextResponse.json({ message: "${endpoint} created" });
}
export async function PUT() {
  return NextResponse.json({ message: "${endpoint} updated" });
}
export async function DELETE() {
  return NextResponse.json({ message: "${endpoint} deleted" });
}
EOF
done

# Additional: notifications/[id] and notifications/clear
mkdir -p app/api/attendee/notifications/[id]
cat > app/api/attendee/notifications/[id]/route.ts << 'EOF'
import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ message: "Notification marked as read" });
}
EOF

cat > app/api/attendee/notifications/clear/route.ts << 'EOF'
import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ message: "All notifications cleared" });
}
EOF

# -------- 9. Install missing packages --------
echo "📦 Install qrcode.react if not already installed:"
echo "npm install qrcode.react"

echo "✅ Attendee Dashboard files created successfully!"
echo ""
echo "📁 Next steps:"
echo "  1. Install dependencies: npm install qrcode.react"
echo "  2. Ensure the following shadcn components are installed:"
echo "     npx shadcn@latest add tabs dialog textarea"
echo "  3. Replace placeholder user IDs in API routes with actual session logic."
echo "  4. Run 'npm run dev' and visit /attendee (login as an ATTENDEE)."
echo "  5. Commit and push: git add . && git commit -m 'feat: add attendee dashboard' && git push"

