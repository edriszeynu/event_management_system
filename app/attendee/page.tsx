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
