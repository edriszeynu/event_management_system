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
        setEvents(Array.isArray(data) ? data : []);
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
