"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AuditLogTable({ logs, loading, onRefresh }: any) {
  const safeLogs = Array.isArray(logs) ? logs : logs?.logs ?? [];

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            safeLogs.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.admin?.email || "System"}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                <TableCell>{log.ip}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
