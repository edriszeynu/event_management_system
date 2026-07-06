"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export function ProfileForm({ user }: any) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/attendee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Saved", description: "Profile updated successfully", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">First Name</FormLabel>
              <FormControl>
                <Input {...field} className="border-0 p-0 h-auto text-base bg-transparent focus-visible:ring-0 shadow-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Last Name</FormLabel>
              <FormControl>
                <Input {...field} className="border-0 p-0 h-auto text-base bg-transparent focus-visible:ring-0 shadow-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
          <p className="text-base text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
    </Form>
  );
}
