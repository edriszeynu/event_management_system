import { Search, Calendar, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Discover, Connect, and Experience</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
          The Ultimate Platform for <br />
          <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            Events & Experiences
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
          Find, register, and manage events effortlessly. Whether you’re an organizer or attendee, we’ve got you covered.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for events, categories..."
              className="pl-10 pr-4 py-6 w-full rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-blue-200 focus-visible:ring-white"
            />
          </div>
          <Button className="rounded-full px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg whitespace-nowrap">
            Search Events
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-300" />
            <span>1000+ Events</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-300" />
            <span>50K+ Attendees</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>Trusted by 200+ Organizers</span>
          </div>
        </div>
      </div>
    </section>
  );
};