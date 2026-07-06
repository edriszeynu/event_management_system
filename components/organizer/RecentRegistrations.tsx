"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  user: { firstName: string; lastName: string; email: string };
  event: { title: string };
  ticketTier: { name: string };
  createdAt: string;
  status: string;
}

export function RecentRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch("/api/organizer/recent-registrations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRegistrations(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load recent registrations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [toast]);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CHECKED_IN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No registrations yet</p>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {reg.user.firstName} {reg.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{reg.event.title}</p>
                  </div>
                  <Badge className={statusColors[reg.status as keyof typeof statusColors] || "bg-gray-100"}>
                    {reg.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{reg.ticketTier.name}</span>
                  <span>{format(new Date(reg.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
