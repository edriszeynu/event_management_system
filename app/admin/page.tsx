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
