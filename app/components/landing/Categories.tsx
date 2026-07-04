import { categories } from '@/data/categories';
import { Card, CardContent } from '@/components/ui/card';

export const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Browse by <span className="text-blue-600">Category</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-gray-50 hover:bg-blue-50">
            <CardContent className="flex flex-col items-center p-6">
              <span className="text-4xl">{cat.icon}</span>
              <span className="mt-2 font-medium text-gray-700">{cat.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};