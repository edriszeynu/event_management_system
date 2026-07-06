"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step3Speakers() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "speakers",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Speakers</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Speaker {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`speakers.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`speakers.${index}.bio`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Input {...field} placeholder="Brief bio" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ name: "", bio: "" })}>
        <Plus className="h-4 w-4 mr-2" /> Add Speaker
      </Button>
    </div>
  );
}
