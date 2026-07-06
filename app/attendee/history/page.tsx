"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/attendee/FeedbackModal";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/attendee/history");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openFeedback = (event: any) => {
    setSelectedEvent(event);
    setFeedbackOpen(true);
  };

  if (loading) {
    return <div className="space-y-4">
      <h1 className="text-2xl font-bold">Event History</h1>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event History</h1>
      {history.length === 0 ? (
        <p className="text-muted-foreground">You haven't attended any events yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                <div>
                  <p className="font-medium">{event.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event.startDate), "MMM d, yyyy")} · {event.ticketTier.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {event.feedback ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{event.feedback.rating}/5</span>
                      {event.feedback.comment && (
                        <span className="text-sm text-muted-foreground ml-1">"{event.feedback.comment}"</span>
                      )}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openFeedback(event)}>
                      <MessageSquare className="h-4 w-4" /> Leave Feedback
                    </Button>
                  )}
                  <Badge variant="secondary">{event.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedEvent && (
        <FeedbackModal
          open={feedbackOpen}
          onOpenChange={setFeedbackOpen}
          event={selectedEvent}
          onRefresh={fetchHistory}
        />
      )}
    </div>
  );
}
