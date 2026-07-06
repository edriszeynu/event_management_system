"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function RevenueChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return (
    <Card><CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">No data</p></CardContent></Card>
  );
  return (
    <Card>
      <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
