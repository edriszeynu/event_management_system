"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventForm } from "@/components/organizer/EventForm";
import { useToast } from "@/hooks/use-toast";

export default function EditEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEventData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, toast]);

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded-xl" />
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <EventForm initialData={eventData} />
    </div>
  );
}
