"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { EventFormData } from "./useEventForm";

export function Step5Preview() {
  const { getValues } = useFormContext<EventFormData>();
  const data = getValues();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview & Publish</h3>
      <Card>
        <CardContent className="space-y-2">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <p><strong>Type:</strong> {data.eventType}</p>
          <p><strong>Capacity:</strong> {data.maxCapacity}</p>
          <p><strong>Start:</strong> {data.startDate?.toString()}</p>
          <p><strong>End:</strong> {data.endDate?.toString()}</p>
          <p><strong>Venue:</strong> {data.venueAddress || "N/A"}</p>
          <p><strong>Virtual Link:</strong> {data.virtualLink || "N/A"}</p>
          <p><strong>Ticket Tiers:</strong> {data.ticketTiers?.length}</p>
          <p><strong>Speakers:</strong> {data.speakers?.length}</p>
          <p><strong>Sessions:</strong> {data.sessions?.length}</p>
        </CardContent>
      </Card>
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Banner image upload will go here.</p>
      </div>
    </div>
  );
}
