"use client";

import { EventForm } from "@/components/organizer/EventForm";

export default function CreateEventPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <EventForm />
    </div>
  );
}
