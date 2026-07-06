"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function RecentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load recent users", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
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
      <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No users yet</p>
          ) : (
            users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
