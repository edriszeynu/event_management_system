"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsSummary({ data }: any) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.totalRegistrations}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${data.revenue?.toFixed(2)}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Check-in Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data.checkInRate}%</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Ticket Price</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${data.avgTicketPrice?.toFixed(2)}</p></CardContent></Card>
    </div>
  );
}
