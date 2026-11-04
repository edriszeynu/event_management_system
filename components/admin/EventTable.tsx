"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DeleteEventDialog } from "@/components/organizer/DeleteEventDialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type EventTableRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" | "ARCHIVED";
  category: string;
  startDate: string;
  organizer?: { firstName?: string; lastName?: string; email?: string };
  _count?: { registrations: number };
};

interface EventTableProps {
  events: EventTableRow[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const statusColors = {
  DRAFT: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20",
  PUBLISHED: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20",
  CANCELLED: "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20",
  COMPLETED: "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/20",
  ARCHIVED: "bg-violet-100 text-violet-800 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/20",
};

const statusLabel = {
  DRAFT: "Pending Review",
  PUBLISHED: "Published",
  CANCELLED: "Rejected",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export function EventTable({ events, loading, total, page, onPageChange, onRefresh }: EventTableProps) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventTableRow | null>(null);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Event deleted", variant: "success" });
      onRefresh();
    } catch {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: newStatus === "PUBLISHED" ? "Event approved and published" : "Event rejected", variant: "success" });
      onRefresh();
    } catch {
      toast({ title: "Error", description: "Failed to update event status", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
      ))}
    </div>;
  }

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-4 py-3">Event</TableHead>
              <TableHead className="px-4 py-3">Organizer</TableHead>
              <TableHead className="px-4 py-3">Category</TableHead>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Registrations</TableHead>
              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No events found for the current moderation filters.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id} className="align-top">
                  <TableCell className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                    {event.organizer?.firstName} {event.organizer?.lastName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">{event.category}</TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge className={statusColors[event.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                      {statusLabel[event.status as keyof typeof statusLabel] || event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">{event._count?.registrations || 0}</TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${event.title}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        {event.status !== "PUBLISHED" && (
                          <DropdownMenuItem
                            className="text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400"
                            onClick={() => handleStatusChange(event.id, "PUBLISHED")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        {event.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400"
                            onClick={() => handleStatusChange(event.id, "CANCELLED")}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <span>Showing {events.length} of {total} results</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      {selectedEvent && (
        <DeleteEventDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={selectedEvent.title}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
