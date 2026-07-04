export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'c1', name: 'Technology', slug: 'tech', icon: '💻' },
  { id: 'c2', name: 'Music', slug: 'music', icon: '🎵' },
  { id: 'c3', name: 'Business', slug: 'business', icon: '💼' },
  { id: 'c4', name: 'Health', slug: 'health', icon: '🏥' },
  { id: 'c5', name: 'Education', slug: 'education', icon: '📚' },
];