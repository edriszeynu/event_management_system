"use client";

import { useState, useEffect, useCallback } from "react";
import { EventTable } from "@/components/admin/EventTable";
import { EventFilters } from "@/components/admin/EventFilters";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock3, XCircle, Layers3 } from "lucide-react";

type EventSummary = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | "ARCHIVED";
  category: string;
  startDate: string;
  organizer?: { firstName?: string; lastName?: string; email?: string };
  _count?: { registrations: number };
};

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  const fetchEvents = useCallback(async () => {
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
      setEvents(data.events as EventSummary[]);
      setTotal(data.total as number);
    } catch {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [category, page, search, status, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEvents();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const pendingCount = events.filter((event) => event.status === "DRAFT").length;
  const publishedCount = events.filter((event) => event.status === "PUBLISHED").length;
  const cancelledCount = events.filter((event) => event.status === "CANCELLED").length;

  const summaryCards = [
    { label: "Pending Review", value: pendingCount, description: "Awaiting admin approval", tone: "amber", icon: Clock3 },
    { label: "Published", value: publishedCount, description: "Visible on public landing page", tone: "green", icon: CheckCircle2 },
    { label: "Rejected", value: cancelledCount, description: "Blocked or cancelled events", tone: "rose", icon: XCircle },
    { label: "Total", value: events.length, description: "Current page results", tone: "blue", icon: Layers3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">Moderation dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Event Approval Queue</h1>
        </div>
        <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
          {total} events tracked
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, description, tone, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={
                tone === "amber" ? "bg-amber-500/10 text-amber-500" :
                tone === "green" ? "bg-emerald-500/10 text-emerald-500" :
                tone === "rose" ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
              + " flex h-10 w-10 items-center justify-center rounded-xl"}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

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
