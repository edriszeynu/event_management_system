"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EventForm } from "@/components/organizer/EventForm";
import type { EventFormInitialData } from "@/components/organizer/EventForm/useEventForm";
import { useToast } from "@/hooks/use-toast";

export default function EditEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [eventData, setEventData] = useState<EventFormInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/organizer/events/${id}`);
        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          throw new Error(result.error || `Could not load event (${res.status}).`);
        }
        const data = await res.json();
        setEventData(data as EventFormInitialData);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load event. Please try again.";
        setLoadError(message);
        toast({
          title: "Error",
          description: message,
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
  if (!eventData) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <p role="alert" className="text-sm text-destructive">{loadError || "Event could not be loaded."}</p>
        <Link href="/organizer/events" className={buttonVariants()}>
          <ArrowLeft aria-hidden="true" />
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Edit Event</h1>
        <EventForm initialData={eventData} />
    </div>
  );
}
