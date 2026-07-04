import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <CalendarDays className="w-6 h-6" />
          EventHub
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-600">Events</Link>
          <Link href="#" className="hover:text-blue-600">About</Link>
          <Link href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
};