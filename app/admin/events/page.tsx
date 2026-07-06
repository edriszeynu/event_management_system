"use client";

import { useState, useEffect } from "react";
import { EventTable } from "@/components/admin/EventTable";
import { EventFilters } from "@/components/admin/EventFilters";
import { useToast } from "@/hooks/use-toast";

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status: status !== "ALL" ? status : "",
        category: category !== "ALL" ? category : "",
      });
      const res = await fetch(`/api/admin/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
      setTotal(data.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, status, category]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Moderation</h1>
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
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
