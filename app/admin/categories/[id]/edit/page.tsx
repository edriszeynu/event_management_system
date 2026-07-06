"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useToast } from "@/hooks/use-toast";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const cat = await res.json();
        setData(cat);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load category", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, toast]);

  if (loading) {
    return <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded-xl" />
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <CategoryForm initialData={data} />
    </div>
  );
}
