"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Minimum 6 characters"),
  newPassword: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function PasswordForm() {
  const { toast } = useToast();
  const form = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to change password");
      toast({ title: "Success", description: "Password changed", variant: "success" });
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="currentPassword" render={({ field }) => (
        <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="newPassword" render={({ field }) => (
        <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="confirmPassword" render={({ field }) => (
        <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <Button type="submit">Change Password</Button>
    </Form>
  );
}
