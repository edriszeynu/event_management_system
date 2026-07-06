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
