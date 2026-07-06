"use client";

import { useState, useEffect } from "react";
import { TicketCard } from "@/components/attendee/TicketCard";
import { useToast } from "@/hooks/use-toast";

export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/attendee/tickets");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [toast]);

  if (loading) {
    return <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't purchased any tickets yet.</p>
          <a href="/events" className="text-primary hover:underline">Browse events</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
