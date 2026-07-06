#!/bin/bash

# Admin Panel - Complete File Creator
# Run this from your project root (where 'app' and 'components' exist)

set -e

echo "🚀 Creating Admin Panel structure..."

# -------- 1. Admin Layout & Pages --------
mkdir -p app/admin/users/[id]
mkdir -p app/admin/events/[id]
mkdir -p app/admin/categories/create
mkdir -p app/admin/categories/[id]/edit
mkdir -p app/admin/settings
mkdir -p app/admin/logs

# -------- 2. Components --------
mkdir -p components/admin

# -------- 3. Write files --------

# app/admin/layout.tsx
cat > app/admin/layout.tsx << 'EOF'
"use client";

import { useAuthStore } from "@/stores/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/organizer/Header";
import { MobileNav } from "@/components/organizer/MobileNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SUPER_ADMIN") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 2) return "Overview";
    const last = segments[segments.length - 1];
    if (last === "users") return "Users";
    if (last === "events") return "Events";
    if (last === "categories") return "Categories";
    if (last === "settings") return "Settings";
    if (last === "logs") return "Audit Logs";
    if (last === "create") return "Create Category";
    if (last === "edit") return "Edit Category";
    return "Overview";
  };

  if (!isAuthenticated || user?.role !== "SUPER_ADMIN") {
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

# components/admin/Sidebar.tsx
cat > components/admin/Sidebar.tsx << 'EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Tag,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/logs", icon: FileText, label: "Audit Logs" },
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
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calendar className="h-6 w-6" />
          EventHub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
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

# app/admin/page.tsx (Dashboard Overview)
cat > app/admin/page.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/organizer/StatsCard";
import { Users, Calendar, DollarSign, Ticket } from "lucide-react";
import { UsersChart } from "@/components/admin/UsersChart";
import { EventsByCategoryChart } from "@/components/admin/EventsByCategoryChart";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { RecentUsers } from "@/components/admin/RecentUsers";
import { RecentEvents } from "@/components/admin/RecentEvents";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
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
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend="+12% from last month"
        />
        <StatsCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString()}
          icon={Calendar}
          trend="+8% from last month"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+15% from last month"
        />
        <StatsCard
          title="Total Registrations"
          value={stats.totalRegistrations.toLocaleString()}
          icon={Ticket}
          trend="+10% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsersChart />
        </div>
        <div>
          <EventsByCategoryChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsers />
        <RecentEvents />
      </div>
    </div>
  );
}
EOF

# components/admin/UsersChart.tsx
cat > components/admin/UsersChart.tsx << 'EOF'
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

export function UsersChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/charts/users");
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
          <CardTitle>User Growth</CardTitle>
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
        <CardTitle>User Growth Over Time</CardTitle>
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
                dataKey="users"
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

# components/admin/EventsByCategoryChart.tsx
cat > components/admin/EventsByCategoryChart.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6"];

export function EventsByCategoryChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/charts/events");
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
          <CardTitle>Events by Category</CardTitle>
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
        <CardTitle>Events by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
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

# components/admin/RevenueChart.tsx
cat > components/admin/RevenueChart.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function RevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/charts/revenue");
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
          <CardTitle>Revenue Trend</CardTitle>
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
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# components/admin/RecentUsers.tsx
cat > components/admin/RecentUsers.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function RecentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load recent users", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
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
      <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No users yet</p>
          ) : (
            users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
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

# components/admin/RecentEvents.tsx
cat > components/admin/RecentEvents.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function RecentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load recent events", variant: "destructive" });
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
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
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
      <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No events yet</p>
          ) : (
            events.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge className={statusColors[event.status as keyof typeof statusColors] || "bg-gray-100"}>
                  {event.status}
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

# app/admin/users/page.tsx
cat > app/admin/users/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        role: role !== "ALL" ? role : "",
        status: status !== "ALL" ? status : "",
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, status]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
      />
      <UserTable
        users={users}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
EOF

# components/admin/UserFilters.tsx
cat > components/admin/UserFilters.tsx << 'EOF'
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Roles</SelectItem>
          <SelectItem value="ATTENDEE">Attendee</SelectItem>
          <SelectItem value="ORGANIZER">Organizer</SelectItem>
          <SelectItem value="SPEAKER">Speaker</SelectItem>
          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

# components/admin/UserTable.tsx (simplified but functional)
cat > components/admin/UserTable.tsx << 'EOF'
"use client";

import { useState } from "react";
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
import { MoreVertical, Edit, Trash2, UserCog, Lock, Unlock } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/organizer/DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function UserTable({ users, loading, total, page, onPageChange, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "User deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.isActive ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: `User ${newStatus.toLowerCase()}`, variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <>
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.isActive ? (
                            <><Lock className="mr-2 h-4 w-4" /> Deactivate</>
                          ) : (
                            <><Unlock className="mr-2 h-4 w-4" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedUser && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={`${selectedUser.firstName} ${selectedUser.lastName}`}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
EOF

# app/admin/events/page.tsx
cat > app/admin/events/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { EventTable } from "@/components/admin/EventTable";
import { EventFilters } from "@/components/admin/EventFilters";
import { useToast } from "@/hooks/use-toast";

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status: status !== "ALL" ? status : "",
        category: category !== "ALL" ? category : "",
      });
      const res = await fetch(`/api/admin/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, status, category]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Moderation</h1>
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
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

# components/admin/EventFilters.tsx
cat > components/admin/EventFilters.tsx << 'EOF'
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function EventFilters({ search, onSearchChange, status, onStatusChange, category, onCategoryChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by title or organizer..."
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
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
          <SelectItem value="Business">Business</SelectItem>
          <SelectItem value="Health">Health</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

# components/admin/EventTable.tsx (simplified)
cat > components/admin/EventTable.tsx << 'EOF'
"use client";

import { useState } from "react";
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
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/organizer/DeleteEventDialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function EventTable({ events, loading, total, page, onPageChange, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Event deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: `Event ${newStatus.toLowerCase()}`, variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <>
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizer?.firstName} {event.organizer?.lastName}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>{format(new Date(event.startDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status as keyof typeof statusColors] || "bg-gray-100"}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event._count?.registrations || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        {event.status !== "PUBLISHED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, "PUBLISHED")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        {event.status !== "CANCELLED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, "CANCELLED")}>
                            <XCircle className="mr-2 h-4 w-4" /> Block
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedEvent && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={selectedEvent.title}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
EOF

# app/admin/categories/page.tsx
cat > app/admin/categories/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </Link>
      </div>
      <CategoryTable categories={categories} loading={loading} onRefresh={fetchCategories} />
    </div>
  );
}
EOF

# components/admin/CategoryTable.tsx
cat > components/admin/CategoryTable.tsx << 'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
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
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/organizer/DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function CategoryTable({ categories, loading, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/categories/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Category deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <>
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Events</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.icon || "📁"}</TableCell>
                  <TableCell>{cat._count?.events || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/${cat.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelected(cat);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selected && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={selected.name}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
EOF

# app/admin/categories/create/page.tsx
cat > app/admin/categories/create/page.tsx << 'EOF'
"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";

export default function CreateCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Category</h1>
      <CategoryForm />
    </div>
  );
}
EOF

# components/admin/CategoryForm.tsx
cat > components/admin/CategoryForm.tsx << 'EOF'
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens"),
  icon: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryForm({ initialData }: { initialData?: CategoryFormData }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || { name: "", slug: "", icon: "", description: "" },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/admin/categories` : `/api/admin/categories`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save category");
      toast({ title: "Success", description: "Category saved", variant: "success" });
      router.push("/admin/categories");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="icon" render={({ field }) => (
          <FormItem><FormLabel>Icon (emoji)</FormLabel><FormControl><Input {...field} placeholder="📁" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">{initialData ? "Update" : "Create"} Category</Button>
      </form>
    </Form>
  );
}
EOF

# app/admin/categories/[id]/edit/page.tsx
cat > app/admin/categories/[id]/edit/page.tsx << 'EOF'
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useToast } from "@/hooks/use-toast";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const cat = await res.json();
        setData(cat);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load category", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, toast]);

  if (loading) {
    return <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded-xl" />
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <CategoryForm initialData={data} />
    </div>
  );
}
EOF

# app/admin/settings/page.tsx
cat > app/admin/settings/page.tsx << 'EOF'
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <SettingsForm category="general" />
        </TabsContent>
        <TabsContent value="payment">
          <SettingsForm category="payment" />
        </TabsContent>
        <TabsContent value="email">
          <SettingsForm category="email" />
        </TabsContent>
        <TabsContent value="features">
          <SettingsForm category="features" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
EOF

# components/admin/SettingsForm.tsx
cat > components/admin/SettingsForm.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const schemas = {
  general: z.object({
    platformName: z.string().min(1, "Platform name is required"),
    defaultCurrency: z.string().min(1, "Currency is required"),
    timezone: z.string().min(1, "Timezone is required"),
    allowRegistration: z.boolean().default(true),
  }),
  payment: z.object({
    platformFee: z.number().min(0).max(100).default(0),
    stripeKey: z.string().optional(),
    paypalKey: z.string().optional(),
  }),
  email: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
  }),
  features: z.object({
    allowFreeEvents: z.boolean().default(true),
    allowVirtualEvents: z.boolean().default(true),
    enableWaitlist: z.boolean().default(true),
  }),
};

export function SettingsForm({ category }: { category: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const form = useForm({
    resolver: zodResolver(schemas[category as keyof typeof schemas] || z.object({})),
    defaultValues: {},
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/admin/settings?category=${category}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        form.reset(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [category, toast, form]);

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/admin/settings?category=${category}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Success", description: "Settings updated", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  const renderField = (name: string, label: string, type: string = "text") => {
    if (type === "switch") {
      return (
        <FormField key={name} control={form.control} name={name} render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />
      );
    }
    return (
      <FormField key={name} control={form.control} name={name} render={({ field }) => (
        <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} type={type} /></FormControl><FormMessage /></FormItem>
      )} />
    );
  };

  // Simplified – you can expand based on your actual settings schema
  const fields: Record<string, any> = {
    general: [
      { name: "platformName", label: "Platform Name" },
      { name: "defaultCurrency", label: "Default Currency" },
      { name: "timezone", label: "Timezone" },
      { name: "allowRegistration", label: "Allow New Registrations", type: "switch" },
    ],
    payment: [
      { name: "platformFee", label: "Platform Fee (%)", type: "number" },
      { name: "stripeKey", label: "Stripe Secret Key" },
      { name: "paypalKey", label: "PayPal Client ID" },
    ],
    email: [
      { name: "smtpHost", label: "SMTP Host" },
      { name: "smtpPort", label: "SMTP Port", type: "number" },
      { name: "smtpUser", label: "SMTP User" },
      { name: "smtpPass", label: "SMTP Password", type: "password" },
    ],
    features: [
      { name: "allowFreeEvents", label: "Allow Free Events", type: "switch" },
      { name: "allowVirtualEvents", label: "Allow Virtual Events", type: "switch" },
      { name: "enableWaitlist", label: "Enable Waitlist", type: "switch" },
    ],
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields[category]?.map((f: any) => renderField(f.name, f.label, f.type || "text"))}
        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  );
}
EOF

# app/admin/logs/page.tsx
cat > app/admin/logs/page.tsx << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { AuditLogFilters } from "@/components/admin/AuditLogFilters";
import { useToast } from "@/hooks/use-toast";

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, action: action !== "ALL" ? action : "", dateRange });
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, action, dateRange]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <AuditLogFilters
        search={search}
        onSearchChange={setSearch}
        action={action}
        onActionChange={setAction}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <AuditLogTable logs={logs} loading={loading} onRefresh={fetchLogs} />
    </div>
  );
}
EOF

# components/admin/AuditLogFilters.tsx
cat > components/admin/AuditLogFilters.tsx << 'EOF'
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function AuditLogFilters({ search, onSearchChange, action, onActionChange, dateRange, onDateRangeChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by admin email or action..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={action} onValueChange={onActionChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Actions</SelectItem>
          <SelectItem value="LOGIN">Login</SelectItem>
          <SelectItem value="LOGOUT">Logout</SelectItem>
          <SelectItem value="USER_CREATED">User Created</SelectItem>
          <SelectItem value="USER_DELETED">User Deleted</SelectItem>
          <SelectItem value="EVENT_CREATED">Event Created</SelectItem>
          <SelectItem value="EVENT_DELETED">Event Deleted</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Time</SelectItem>
          <SelectItem value="TODAY">Today</SelectItem>
          <SelectItem value="WEEK">Last 7 Days</SelectItem>
          <SelectItem value="MONTH">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
EOF

# components/admin/AuditLogTable.tsx
cat > components/admin/AuditLogTable.tsx << 'EOF'
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AuditLogTable({ logs, loading, onRefresh }: any) {
  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.admin?.email || "System"}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                <TableCell>{log.ip}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
EOF

# Add any missing shadcn components that may not exist yet
echo "✅ Admin Panel files created successfully!"
echo ""
echo "📁 Next steps:"
echo "  1. Install required packages: npm install recharts react-hook-form @hookform/resolvers zod"
echo "  2. Ensure the following shadcn components are installed:"
echo "     npx shadcn@latest add table form select tabs dialog dropdown-menu card badge button input textarea switch"
echo "  3. Create the API routes in app/api/admin/* (see prompts for details)."
echo "  4. Run 'npm run dev' and visit /admin (login as SUPER_ADMIN)."
echo "  5. Commit and push: git add . && git commit -m 'feat: add admin panel' && git push"

