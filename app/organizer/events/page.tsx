"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventTable } from "@/components/organizer/EventTable";
import { EventFilters } from "@/components/organizer/EventFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status: status !== "ALL" ? status : "",
      });
      const res = await fetch(`/api/organizer/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link href="/organizer/events/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
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
