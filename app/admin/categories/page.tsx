"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </Link>
      </div>
      <CategoryTable categories={categories} loading={loading} onRefresh={fetchCategories} />
    </div>
  );
}
