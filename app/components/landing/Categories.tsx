'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/lib/types';

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Browse by <span className="text-primary">Category</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-lg transition-all cursor-pointer border border-border hover:border-primary/40 hover:bg-primary/5">
            <CardContent className="flex flex-col items-center p-6">
              <span className="text-4xl">{cat.icon}</span>
              <span className="mt-2 font-medium text-foreground">{cat.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
