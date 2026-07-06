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
        setEvents(Array.isArray(data) ? data : data.events ?? []);
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
