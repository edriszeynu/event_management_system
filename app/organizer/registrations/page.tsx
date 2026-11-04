"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Users, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AllRegistrationsPage() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // This would fetch all registrations across all organizer events
      // For now, showing a placeholder
      setStats({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });
      setRegistrations([]);
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

  const statsCards = [
    { label: "Total", value: stats.total, icon: Users, color: "text-blue-500" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">All Registrations</h1>
          <p className="text-muted-foreground">View and manage registrations across all your events</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by attendee name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No registrations yet</p>
              <p className="text-muted-foreground">Registrations will appear here once attendees register for your events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                  <div>
                    <p className="font-medium">{reg.attendeeName}</p>
                    <p className="text-sm text-muted-foreground">{reg.eventTitle}</p>
                  </div>
                  <Badge>{reg.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
