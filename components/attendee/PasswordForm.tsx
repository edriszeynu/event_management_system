"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Minimum 6 characters"),
  newPassword: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function PasswordForm() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const form = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/attendee/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Password changed", description: "Your password has been updated", variant: "success" });
      form.reset();
    } catch {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "currentPassword", label: "Current Password", icon: KeyRound },
    { name: "newPassword", label: "New Password", icon: ShieldCheck },
    { name: "confirmPassword", label: "Confirm New Password", icon: ShieldCheck },
  ];

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {fields.map(({ name, label }) => (
          <FormField key={name} control={form.control} name={name} render={({ field }) => (
            <FormItem className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">{label}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  className="border-0 p-0 h-auto text-base bg-transparent focus-visible:ring-0 shadow-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        ))}

        <div className="pt-2">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {saving ? "Saving..." : "Change Password"}
          </Button>
        </div>
    </Form>
  );
}
