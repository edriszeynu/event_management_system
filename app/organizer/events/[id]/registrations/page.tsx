"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { RegistrationTable } from "@/components/organizer/RegistrationTable";
import { RegistrationFilters } from "@/components/organizer/RegistrationFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0, cancelled: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status: status !== "ALL" ? status : "" });
      const res = await fetch(`/api/events/${eventId}/registrations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRegistrations(data.registrations);
      setStats(data.stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrations</h1>
        <p className="text-muted-foreground">Manage attendees for this event</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.cancelled}</p></CardContent>
        </Card>
      </div>
      <RegistrationFilters search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />
      <RegistrationTable registrations={registrations} loading={loading} onRefresh={fetchRegistrations} eventId={eventId} />
    </div>
  );
}
