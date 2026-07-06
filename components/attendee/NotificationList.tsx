"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/attendee/notifications?limit=5");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
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
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No notifications</p>
          ) : (
            notifications.map((notif: any) => (
              <div key={notif.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{notif.subject}</p>
                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(notif.sentAt), "MMM d, yyyy")}</p>
                </div>
                <Badge variant={notif.isRead ? "secondary" : "default"}>
                  {notif.isRead ? "Read" : "Unread"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
