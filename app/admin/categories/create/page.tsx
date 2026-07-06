"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";

export default function CreateCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Category</h1>
      <CategoryForm />
    </div>
  );
}
