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
  // Simplified version – full code is in previous answer
  return (
    <div className="border rounded-xl">
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
          {events.map((event: any) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{format(new Date(event.startDate), "MMM d, yyyy")}</TableCell>
              <TableCell><Badge>{event.status}</Badge></TableCell>
              <TableCell className="text-right">{event.registrationsCount}</TableCell>
              <TableCell className="text-right">${event.revenue?.toFixed(2) || "0.00"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`/organizer/events/${event.id}/edit`} />}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
  );
}
