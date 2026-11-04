"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, ListOrdered, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type WaitlistEntry = {
  id: string;
  registeredAt: string;
  position: number;
  event: {
    title: string;
    slug: string;
    startDate: string;
    eventType: string;
    venueAddress: string | null;
  };
};

export default function AttendeeWaitlistPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/attendee/waitlist")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load your waitlist");
        setEntries(await response.json());
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load your waitlist", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const leaveWaitlist = async (slug: string, id: string) => {
    setLeavingId(id);
    try {
      const response = await fetch(`/api/events/${slug}/waitlist`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not leave the waitlist");
      setEntries((current) => current.filter((entry) => entry.id !== id));
      toast({ title: "Left waitlist", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Could not leave the waitlist", variant: "destructive" });
    } finally {
      setLeavingId(null);
    }
  };

  if (loading) {
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">My Waitlist</h1><div className="h-28 animate-pulse rounded-lg bg-muted" /></div>;
  }

  return (
    <section className="max-w-4xl space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-semibold">My Waitlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your place in line for sold-out events.</p>
      </header>
      {entries.length === 0 ? (
        <div className="py-12 text-center">
          <ListOrdered className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">You are not on any waitlists</p>
          <p className="mt-1 text-sm text-muted-foreground">Join a waitlist from a sold-out event page.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Browse events</Link>
        </div>
      ) : (
        <div className="divide-y border-y">
          {entries.map((entry) => (
            <article key={entry.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="min-w-0">
                <Link href={`/events/${entry.event.slug}`} className="font-medium hover:text-primary hover:underline">
                  {entry.event.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(new Date(entry.event.startDate), "MMM d, yyyy · h:mm a")} · {entry.event.eventType === "VIRTUAL" ? "Virtual" : entry.event.venueAddress || "Venue TBA"}
                </p>
                <p className="mt-2 text-sm">Queue position <span className="font-semibold">{entry.position}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/events/${entry.event.slug}`} aria-label={`View ${entry.event.title}`}>
                  <Button variant="ghost" size="icon"><ArrowUpRight className="h-4 w-4" /></Button>
                </Link>
                <Button variant="outline" size="sm" disabled={leavingId === entry.id} onClick={() => leaveWaitlist(entry.event.slug, entry.id)}>
                  <X className="mr-1 h-4 w-4" /> Leave
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}