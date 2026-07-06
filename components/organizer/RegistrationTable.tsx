"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function RegistrationTable({ registrations, loading, onRefresh, eventId }: any) {
  // Simplified version
  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attendee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ticket</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Check-in</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg: any) => (
            <TableRow key={reg.id}>
              <TableCell>{reg.user.firstName} {reg.user.lastName}</TableCell>
              <TableCell>{reg.user.email}</TableCell>
              <TableCell>{reg.ticketTier.name}</TableCell>
              <TableCell>{format(new Date(reg.createdAt), "MMM d, yyyy")}</TableCell>
              <TableCell><Badge>{reg.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">Check In</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
