"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Users, DollarSign, Calendar, ArrowUp, ArrowDown } from "lucide-react";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    activeEvents: 0,
    avgTicketPrice: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Placeholder for analytics API
      setStats({
        totalRevenue: 0,
        totalTickets: 0,
        activeEvents: 0,
        avgTicketPrice: 0,
      });
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

  const metricsCards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "text-green-500",
    },
    {
      label: "Tickets Sold",
      value: stats.totalTickets.toLocaleString(),
      icon: Users,
      trend: "+8.2%",
      trendUp: true,
      color: "text-blue-500",
    },
    {
      label: "Active Events",
      value: stats.activeEvents,
      icon: Calendar,
      trend: "+3",
      trendUp: true,
      color: "text-purple-500",
    },
    {
      label: "Avg Ticket Price",
      value: `$${stats.avgTicketPrice.toFixed(2)}`,
      icon: TrendingUp,
      trend: "-2.1%",
      trendUp: false,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Track performance across all your events</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((metric) => (
          <Card key={metric.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br from-${metric.color.split('-')[1]}-500/10 to-${metric.color.split('-')[1]}-500/5`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trendUp ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${metric.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No events data available</p>
            <p className="text-muted-foreground">Create events to see detailed analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
