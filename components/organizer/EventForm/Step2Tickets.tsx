"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { EventFormData } from "./useEventForm";

export function Step2Tickets() {
  const { control } = useFormContext<EventFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTiers",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ticket Tiers</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Tier {index + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`ticketTiers.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="VIP" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`ticketTiers.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        field.onChange(raw === "" ? 0 : Number(raw));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`ticketTiers.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="What this ticket includes" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`ticketTiers.${index}.quantityTotal`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      field.onChange(raw === "" ? 0 : Number.parseInt(raw, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name={`ticketTiers.${index}.salesStart`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Start</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                      onChange={(event) => field.onChange(event.target.value ? new Date(event.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`ticketTiers.${index}.salesEnd`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales End</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                      onChange={(event) => field.onChange(event.target.value ? new Date(event.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ name: "", price: 0, quantityTotal: 0, quantitySold: 0 })}>
        <Plus className="h-4 w-4 mr-2" /> Add Tier
      </Button>
    </div>
  );
}
