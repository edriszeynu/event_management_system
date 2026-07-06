"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/attendee/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/attendee/notifications/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark as read");
      fetchNotifications();
      toast({ title: "Marked as read", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch("/api/attendee/notifications/clear", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      fetchNotifications();
      toast({ title: "Cleared all notifications", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to clear", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearAll}>Clear All</Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif: any) => (
            <Card key={notif.id} className={notif.isRead ? "opacity-70" : "border-primary/20"}>
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex-1">
                  <p className="font-medium">{notif.subject}</p>
                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(notif.sentAt), "MMM d, yyyy HH:mm")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!notif.isRead && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notif.id)}>Mark as read</Button>
                  )}
                  <Badge variant={notif.isRead ? "secondary" : "default"}>
                    {notif.isRead ? "Read" : "Unread"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
