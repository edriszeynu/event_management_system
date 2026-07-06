"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens"),
  icon: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryForm({ initialData }: { initialData?: CategoryFormData }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || { name: "", slug: "", icon: "", description: "" },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/admin/categories` : `/api/admin/categories`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save category");
      toast({ title: "Success", description: "Category saved", variant: "success" });
      router.push("/admin/categories");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="icon" render={({ field }) => (
          <FormItem><FormLabel>Icon (emoji)</FormLabel><FormControl><Input {...field} placeholder="📁" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">{initialData ? "Update" : "Create"} Category</Button>
    </Form>
  );
}
