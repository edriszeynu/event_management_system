# Paste the entire script content here (from the previous answer)
#!/bin/bash

# Organizer Dashboard - Complete File Creator
# Run this from your project root (where 'app' and 'components' exist)

set -e

echo "🚀 Creating Organizer Dashboard structure..."

# -------- 1. Organizer Layout & Pages --------
mkdir -p app/organizer/events/create
mkdir -p app/organizer/events/[id]/edit
mkdir -p app/organizer/events/[id]/registrations
mkdir -p app/organizer/events/[id]/analytics
mkdir -p app/organizer/settings

# -------- 2. Components --------
mkdir -p components/organizer/EventForm

# -------- 3. Write files --------

# app/organizer/layout.tsx
cat > app/organizer/layout.tsx << 'EOF'
"use client";

import { useAuthStore } from "@/stores/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/organizer/Sidebar";
import { Header } from "@/components/organizer/Header";
import { MobileNav } from "@/components/organizer/MobileNav";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "ORGANIZER" && user?.role !== "SUPER_ADMIN")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 2) return "Overview";
    const last = segments[segments.length - 1];
    if (last === "create") return "Create Event";
    if (last === "edit") return "Edit Event";
    if (last === "registrations") return "Registrations";
    if (last === "analytics") return "Analytics";
    if (last === "settings") return "Settings";
    if (last === "events") return "My Events";
    return "Overview";
  };

  if (!isAuthenticated || (user?.role !== "ORGANIZER" && user?.role !== "SUPER_ADMIN")) {
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

# components/organizer/Sidebar.tsx
cat > components/organizer/Sidebar.tsx << 'EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/organizer", icon: LayoutDashboard, label: "Overview" },
  { href: "/organizer/events", icon: Calendar, label: "Events" },
  { href: "/organizer/registrations", icon: Ticket, label: "Registrations" },
  { href: "/organizer/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/organizer/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link href="/organizer" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calendar className="h-6 w-6" />
          EventHub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Organizer Dashboard</p>
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

# components/organizer/Header.tsx
cat > components/organizer/Header.tsx << 'EOF'
"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Link from "next/link";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-sm mx-4 hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 h-9 rounded-xl bg-muted/50 border-border focus:border-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.firstName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/organizer/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
EOF

# components/organizer/MobileNav.tsx
cat > components/organizer/MobileNav.tsx << 'EOF'
"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
EOF

# app/organizer/page.tsx
cat > app/organizer/page.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/organizer/StatsCard";
import { RecentEvents } from "@/components/organizer/RecentEvents";
import { RecentRegistrations } from "@/components/organizer/RecentRegistrations";
import { RegistrationsChart } from "@/components/organizer/RegistrationsChart";
import { Calendar, Users, DollarSign, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrganizerDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    revenue: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/organizer/stats");
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-muted animate-pulse rounded-xl" />
        <div className="h-80 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          trend="+12% from last month"
        />
        <StatsCard
          title="Total Attendees"
          value={stats.totalAttendees}
          icon={Users}
          trend="+8% from last month"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+15% from last month"
        />
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={CalendarDays}
          trend="Next event in 3 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentEvents />
        </div>
        <div>
          <RecentRegistrations />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RegistrationsChart />
      </div>
    </div>
  );
}
EOF

# components/organizer/StatsCard.tsx
cat > components/organizer/StatsCard.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("border-border shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold mt-3">{value}</p>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
EOF

# components/organizer/RecentEvents.tsx
cat > components/organizer/RecentEvents.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  startDate: string;
  status: string;
  registrationsCount: number;
}

export function RecentEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/organizer/events?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load recent events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  const statusColors = {
    DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Events</CardTitle>
        <Link href="/organizer/events">
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No events yet</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {event.registrationsCount} registered
                  </span>
                  <Badge className={statusColors[event.status as keyof typeof statusColors] || "bg-gray-100"}>
                    {event.status}
                  </Badge>
                  <Link href={`/organizer/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# components/organizer/RecentRegistrations.tsx
cat > components/organizer/RecentRegistrations.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  user: { firstName: string; lastName: string; email: string };
  event: { title: string };
  ticketTier: { name: string };
  createdAt: string;
  status: string;
}

export function RecentRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch("/api/organizer/recent-registrations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRegistrations(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load recent registrations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [toast]);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CHECKED_IN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
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
        <CardTitle>Recent Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No registrations yet</p>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {reg.user.firstName} {reg.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{reg.event.title}</p>
                  </div>
                  <Badge className={statusColors[reg.status as keyof typeof statusColors] || "bg-gray-100"}>
                    {reg.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{reg.ticketTier.name}</span>
                  <span>{format(new Date(reg.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# components/organizer/RegistrationsChart.tsx
cat > components/organizer/RegistrationsChart.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  date: string;
  registrations: number;
}

export function RegistrationsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/organizer/registrations-chart");
        if (!res.ok) throw new Error("Failed to fetch");
        const chartData = await res.json();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrations Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# app/organizer/events/create/page.tsx
cat > app/organizer/events/create/page.tsx << 'EOF'
"use client";

import { EventForm } from "@/components/organizer/EventForm";

export default function CreateEventPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <EventForm />
    </div>
  );
}
EOF

# components/organizer/EventForm/index.tsx
cat > components/organizer/EventForm/index.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Tickets } from "./Step2Tickets";
import { Step3Speakers } from "./Step3Speakers";
import { Step4Sessions } from "./Step4Sessions";
import { Step5Preview } from "./Step5Preview";
import { eventSchema, EventFormData } from "./useEventForm";

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "tickets", label: "Tickets" },
  { id: "speakers", label: "Speakers" },
  { id: "sessions", label: "Sessions" },
  { id: "preview", label: "Preview" },
];

export function EventForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      eventType: "PHYSICAL",
      startDate: new Date(),
      endDate: new Date(),
      timezone: "UTC",
      venueAddress: "",
      virtualLink: "",
      maxCapacity: 100,
      ticketTiers: [{ name: "General Admission", price: 0, quantityTotal: 100 }],
      speakers: [],
      sessions: [],
      bannerImage: "",
    },
  });

  const { handleSubmit, trigger } = methods;

  const nextStep = async () => {
    let fields: (keyof EventFormData)[] = [];
    if (currentStep === 0) fields = ["title", "description", "category", "startDate", "endDate", "eventType"];
    else if (currentStep === 1) fields = ["ticketTiers"];
    else if (currentStep === 2) fields = ["speakers"];
    else if (currentStep === 3) fields = ["sessions"];

    const isValid = await trigger(fields);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast({
        title: "Success",
        description: "Event created successfully!",
        variant: "success",
      });
      router.push("/organizer/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1BasicInfo />;
      case 1: return <Step2Tickets />;
      case 2: return <Step3Speakers />;
      case 3: return <Step4Sessions />;
      case 4: return <Step5Preview />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {renderStep()}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button type="submit">Create Event</Button>
          ) : (
            <Button type="button" onClick={nextStep}>Next</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
EOF

# components/organizer/EventForm/useEventForm.ts
cat > components/organizer/EventForm/useEventForm.ts << 'EOF'
import { z } from "zod";

export const ticketTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be >= 0"),
  quantityTotal: z.number().int().positive("Must be at least 1"),
  quantitySold: z.number().int().min(0).default(0),
  salesStart: z.date().optional(),
  salesEnd: z.date().optional(),
});

export const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  photo: z.string().url("Invalid URL").optional(),
  company: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
});

export const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  room: z.string().optional(),
  speakerId: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  eventType: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]),
  startDate: z.date(),
  endDate: z.date(),
  timezone: z.string().default("UTC"),
  venueAddress: z.string().optional(),
  virtualLink: z.string().url("Invalid URL").optional(),
  maxCapacity: z.number().int().positive("Must be at least 1"),
  bannerImage: z.string().url("Invalid URL").optional(),
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket tier is required"),
  speakers: z.array(speakerSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
});

export type EventFormData = z.infer<typeof eventSchema>;
EOF

# components/organizer/EventForm/StepIndicator.tsx
cat > components/organizer/EventForm/StepIndicator.tsx << 'EOF'
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: { id: string; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className={cn(
              "text-sm font-medium",
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-12 h-0.5 mx-2",
              index < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
EOF

# We'll create simplified versions of the remaining Step components.
# For brevity, we'll create placeholder files that can be expanded later.

cat > components/organizer/EventForm/Step1BasicInfo.tsx << 'EOF'
"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventFormData } from "./useEventForm";

export function Step1BasicInfo() {
  const { control } = useFormContext<EventFormData>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Tech Conference 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your event..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PHYSICAL">Physical</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="maxCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={field.value instanceof Date ? field.value.toISOString().slice(0,16) : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={field.value instanceof Date ? field.value.toISOString().slice(0,16) : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="venueAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venue Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St, City" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="virtualLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Virtual Link (if any)</FormLabel>
            <FormControl>
              <Input placeholder="https://zoom.us/..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
EOF

# For Step2, Step3, Step4, Step5, we'll create simplified placeholders (you can expand them later)

cat > components/organizer/EventForm/Step2Tickets.tsx << 'EOF'
"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step2Tickets() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTiers",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ticket Tiers</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Tier {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`ticketTiers.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="VIP" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`ticketTiers.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`ticketTiers.${index}.quantityTotal`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ name: "", price: 0, quantityTotal: 0 })}>
        <Plus className="h-4 w-4 mr-2" /> Add Tier
      </Button>
    </div>
  );
}
EOF

cat > components/organizer/EventForm/Step3Speakers.tsx << 'EOF'
"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step3Speakers() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "speakers",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Speakers</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Speaker {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`speakers.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`speakers.${index}.bio`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Input {...field} placeholder="Brief bio" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ name: "", bio: "" })}>
        <Plus className="h-4 w-4 mr-2" /> Add Speaker
      </Button>
    </div>
  );
}
EOF

cat > components/organizer/EventForm/Step4Sessions.tsx << 'EOF'
"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step4Sessions() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sessions</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Session {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`sessions.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} placeholder="Keynote" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sessions.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} placeholder="Session description" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ title: "", description: "", startTime: new Date(), endTime: new Date() })}>
        <Plus className="h-4 w-4 mr-2" /> Add Session
      </Button>
    </div>
  );
}
EOF

cat > components/organizer/EventForm/Step5Preview.tsx << 'EOF'
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { EventFormData } from "./useEventForm";

export function Step5Preview() {
  const { getValues } = useFormContext<EventFormData>();
  const data = getValues();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview & Publish</h3>
      <Card>
        <CardContent className="space-y-2">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <p><strong>Type:</strong> {data.eventType}</p>
          <p><strong>Capacity:</strong> {data.maxCapacity}</p>
          <p><strong>Start:</strong> {data.startDate?.toString()}</p>
          <p><strong>End:</strong> {data.endDate?.toString()}</p>
          <p><strong>Venue:</strong> {data.venueAddress || "N/A"}</p>
          <p><strong>Virtual Link:</strong> {data.virtualLink || "N/A"}</p>
          <p><strong>Ticket Tiers:</strong> {data.ticketTiers?.length}</p>
          <p><strong>Speakers:</strong> {data.speakers?.length}</p>
          <p><strong>Sessions:</strong> {data.sessions?.length}</p>
        </CardContent>
      </Card>
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Banner image upload will go here.</p>
      </div>
    </div>
  );
}
EOF

# app/organizer/events/page.tsx
cat > app/organizer/events/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventTable } from "@/components/organizer/EventTable";
import { EventFilters } from "@/components/organizer/EventFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status: status !== "ALL" ? status : "",
      });
      const res = await fetch(`/api/organizer/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link href="/organizer/events/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />
      <EventTable
        events={events}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onRefresh={fetchEvents}
      />
    </div>
  );
}
EOF

# We'll create simplified placeholder components for EventTable, EventFilters, etc.

cat > components/organizer/EventFilters.tsx << 'EOF'
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function EventFilters({ search, onSearchChange, status, onStatusChange }: EventFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

# For brevity, we'll create minimal versions of other required components. They can be expanded later.
# We'll create a basic EventTable, DeleteEventDialog, etc.

cat > components/organizer/EventTable.tsx << 'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function EventTable({ events, loading, total, page, onPageChange, onRefresh }: any) {
  // Simplified version – full code is in previous answer
  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Registrations</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event: any) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{format(new Date(event.startDate), "MMM d, yyyy")}</TableCell>
              <TableCell><Badge>{event.status}</Badge></TableCell>
              <TableCell className="text-right">{event.registrationsCount}</TableCell>
              <TableCell className="text-right">${event.revenue?.toFixed(2) || "0.00"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/events/${event.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
EOF

cat > components/organizer/DeleteEventDialog.tsx << 'EOF'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteEventDialog({ open, onOpenChange, eventTitle, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{eventTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
EOF

# We'll create a minimal RegistrationTable, RegistrationFilters, etc.

cat > components/organizer/RegistrationTable.tsx << 'EOF'
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function RegistrationTable({ registrations, loading, onRefresh, eventId }: any) {
  // Simplified version
  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attendee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ticket</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Check-in</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg: any) => (
            <TableRow key={reg.id}>
              <TableCell>{reg.user.firstName} {reg.user.lastName}</TableCell>
              <TableCell>{reg.user.email}</TableCell>
              <TableCell>{reg.ticketTier.name}</TableCell>
              <TableCell>{format(new Date(reg.createdAt), "MMM d, yyyy")}</TableCell>
              <TableCell><Badge>{reg.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">Check In</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
EOF

cat > components/organizer/RegistrationFilters.tsx << 'EOF'
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function RegistrationFilters({ search, onSearchChange, status, onStatusChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search attendees..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="CHECKED_IN">Checked In</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

cat > components/organizer/CheckInButton.tsx << 'EOF'
"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

export function CheckInButton({ checkedIn, onCheckIn, disabled }: any) {
  return (
    <Button
      variant={checkedIn ? "default" : "outline"}
      size="sm"
      onClick={onCheckIn}
      disabled={disabled}
      className={checkedIn ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {checkedIn ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" /> Checked In
        </>
      ) : (
        <>
          <Circle className="h-4 w-4 mr-1" /> Check In
        </>
      )}
    </Button>
  );
}
EOF

cat > components/organizer/ExportButton.tsx << 'EOF'
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ registrations, eventId }: any) {
  const handleExport = () => {
    // Simple CSV export
    const headers = ["Name", "Email", "Ticket", "Status", "Registered"];
    const rows = registrations.map((reg: any) => [
      `${reg.user.firstName} ${reg.user.lastName}`,
      reg.user.email,
      reg.ticketTier.name,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" /> Export CSV
    </Button>
  );
}
EOF

# app/organizer/events/[id]/edit/page.tsx
cat > app/organizer/events/[id]/edit/page.tsx << 'EOF'
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventForm } from "@/components/organizer/EventForm";
import { useToast } from "@/hooks/use-toast";

export default function EditEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEventData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, toast]);

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded-xl" />
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <EventForm initialData={eventData} />
    </div>
  );
}
EOF

# app/organizer/events/[id]/registrations/page.tsx
cat > app/organizer/events/[id]/registrations/page.tsx << 'EOF'
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { RegistrationTable } from "@/components/organizer/RegistrationTable";
import { RegistrationFilters } from "@/components/organizer/RegistrationFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0, cancelled: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status: status !== "ALL" ? status : "" });
      const res = await fetch(`/api/events/${eventId}/registrations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRegistrations(data.registrations);
      setStats(data.stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrations</h1>
        <p className="text-muted-foreground">Manage attendees for this event</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.cancelled}</p></CardContent>
        </Card>
      </div>
      <RegistrationFilters search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />
      <RegistrationTable registrations={registrations} loading={loading} onRefresh={fetchRegistrations} eventId={eventId} />
    </div>
  );
}
EOF

# app/organizer/events/[id]/analytics/page.tsx
cat > app/organizer/events/[id]/analytics/page.tsx << 'EOF'
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AnalyticsSummary } from "@/components/organizer/AnalyticsSummary";
import { RegistrationsChart } from "@/components/organizer/RegistrationsChart";
import { TicketDistributionChart } from "@/components/organizer/TicketDistributionChart";
import { RevenueChart } from "@/components/organizer/RevenueChart";
import { useToast } from "@/hooks/use-toast";

export default function AnalyticsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/analytics`);
        if (!res.ok) throw new Error("Failed to fetch");
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [eventId, toast]);

  if (loading) {
    return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-muted animate-pulse rounded-xl" />
        <div className="h-72 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Analytics</h1>
      <AnalyticsSummary data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationsChart data={data?.registrationsOverTime} />
        <TicketDistributionChart data={data?.ticketDistribution} />
      </div>
      <RevenueChart data={data?.revenueOverTime} />
    </div>
  );
}
EOF

# app/organizer/settings/page.tsx
cat > app/organizer/settings/page.tsx << 'EOF'
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/organizer/ProfileForm";
import { PasswordForm } from "@/components/organizer/PasswordForm";
import { AvatarUpload } from "@/components/organizer/AvatarUpload";
import { useAuthStore } from "@/stores/auth";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
        <TabsContent value="notifications">
          <p className="text-muted-foreground">Notification preferences coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
EOF

# Create minimal components for Settings
cat > components/organizer/ProfileForm.tsx << 'EOF'
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
      const res = await fetch("/api/user/profile", {
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

cat > components/organizer/PasswordForm.tsx << 'EOF'
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
      const res = await fetch("/api/user/password", {
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

cat > components/organizer/AvatarUpload.tsx << 'EOF'
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
        <AvatarFallback className="text-2xl">JD</AvatarFallback>
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

# Minimal Analytics components
cat > components/organizer/AnalyticsSummary.tsx << 'EOF'
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsSummary({ data }: any) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.totalRegistrations}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${data.revenue?.toFixed(2)}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Check-in Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.checkInRate}%</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Ticket Price</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${data.avgTicketPrice?.toFixed(2)}</p></CardContent></Card>
    </div>
  );
}
EOF

cat > components/organizer/TicketDistributionChart.tsx << 'EOF'
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function TicketDistributionChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return (
    <Card><CardHeader><CardTitle>Ticket Distribution</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No data</p></CardContent></Card>
  );
  return (
    <Card>
      <CardHeader><CardTitle>Ticket Distribution</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

cat > components/organizer/RevenueChart.tsx << 'EOF'
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function RevenueChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return (
    <Card><CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No data</p></CardContent></Card>
  );
  return (
    <Card>
      <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# Create a generic Skeleton component (if not already)
mkdir -p components/ui
cat > components/ui/skeleton.tsx << 'EOF'
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
EOF

echo "✅ Organizer Dashboard files created successfully!"
echo "📁 Next steps:"
echo "  1. Install dependencies: npm install recharts react-hook-form @hookform/resolvers zod"
echo "  2. Ensure your API routes are implemented (see prompts)."
echo "  3. Run 'npm run dev' and visit /organizer"
