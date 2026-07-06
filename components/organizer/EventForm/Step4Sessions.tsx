"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step4Sessions() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sessions</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Session {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`sessions.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} placeholder="Keynote" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sessions.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} placeholder="Session description" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ title: "", description: "", startTime: new Date(), endTime: new Date() })}>
        <Plus className="h-4 w-4 mr-2" /> Add Session
      </Button>
    </div>
  );
}
