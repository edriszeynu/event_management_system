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
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DeleteEventDialog } from "@/components/organizer/DeleteEventDialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function EventTable({ events, loading, total, page, onPageChange, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Event deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: `Event ${newStatus.toLowerCase()}`, variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <>
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizer?.firstName} {event.organizer?.lastName}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>{format(new Date(event.startDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status as keyof typeof statusColors] || "bg-gray-100"}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event._count?.registrations || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        {event.status !== "PUBLISHED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, "PUBLISHED")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                        )}
                        {event.status !== "CANCELLED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(event.id, "CANCELLED")}>
                            <XCircle className="mr-2 h-4 w-4" /> Block
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
