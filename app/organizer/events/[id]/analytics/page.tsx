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
