"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export function ProfileForm({ user }: any) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || "", lastName: user?.lastName || "" },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast({ title: "Success", description: "Profile updated", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input value={user?.email} disabled />
        </div>
        <Button type="submit">Save Changes</Button>
    </Form>
  );
}
