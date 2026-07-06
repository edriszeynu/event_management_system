"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ registrations, eventId }: any) {
  const handleExport = () => {
    // Simple CSV export
    const headers = ["Name", "Email", "Ticket", "Status", "Registered"];
    const rows = registrations.map((reg: any) => [
      `${reg.user.firstName} ${reg.user.lastName}`,
      reg.user.email,
      reg.ticketTier.name,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" /> Export CSV
    </Button>
  );
}
