"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
import { MoreVertical, Edit, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function EventTable({ events, loading, total, page, onPageChange, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedEvent || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/organizer/events/${selectedEvent.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not delete this event.");
      toast({ title: "Event deleted", description: `${selectedEvent.title} was deleted.`, variant: "success" });
      setDeleteOpen(false);
      setSelectedEvent(null);
      await onRefresh();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete this event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Registrations</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading events...</TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No events found.</TableCell></TableRow>
            ) : events.map((event: any) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{format(new Date(event.startDate), "MMM d, yyyy")}</TableCell>
                <TableCell><Badge>{event.status}</Badge></TableCell>
                <TableCell className="text-right">{event.registrationsCount}</TableCell>
                <TableCell className="text-right">${event.revenue?.toFixed(2) || "0.00"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted" aria-label={`Actions for ${event.title}`}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/organizer/events/${event.id}/edit`} />}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
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
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteEventDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        eventTitle={selectedEvent?.title ?? ""}
        onConfirm={handleDelete}
        isDeleting={deleting}
        registrationCount={selectedEvent?.registrationsCount ?? 0}
      />
    </>
  );
}
