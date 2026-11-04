"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  date: string;
  registrations: number;
}

export function RegistrationsChart({ data }: { data?: ChartData[] }) {
  const [organizerData, setOrganizerData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/organizer/registrations-chart");
        if (!response.ok) throw new Error("Failed to fetch registration chart data");
        setOrganizerData(await response.json());
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [data]);

  const chartData = data ?? organizerData;

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Registrations Trend</CardTitle></CardHeader>
        <CardContent><div className="h-72 bg-muted animate-pulse rounded" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
