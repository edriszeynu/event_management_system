import { Search, Calendar, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 text-white dark:bg-[#030b13] dark:bg-none">
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-center dark:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2200&q=85')",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,10,18,.92)_0%,rgba(2,10,18,.72)_48%,rgba(2,10,18,.28)_100%),linear-gradient(0deg,rgba(2,10,18,.78),transparent_65%)] dark:block" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:py-32 dark:text-left">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm dark:border dark:border-white/15 dark:bg-white/10">
          <Sparkles className="w-4 h-4" />
          <span>Discover, Connect, and Experience</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl dark:mx-0 dark:font-serif dark:font-normal">
          The Ultimate Platform for <br />
          <span className="bg-linear-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent dark:from-amber-200 dark:to-orange-500">
            Events & Experiences
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 md:text-xl dark:mx-0 dark:text-slate-200">
          Find, register, and manage events effortlessly. Whether you’re an organizer or attendee, we’ve got you covered.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center justify-center gap-4 sm:flex-row dark:mx-0 dark:justify-start">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for events, categories..."
              className="w-full rounded-full border-white/30 bg-white/20 py-6 pl-10 pr-4 text-white placeholder:text-blue-200 backdrop-blur-sm focus-visible:ring-white dark:border-white/20 dark:bg-black/35 dark:placeholder:text-slate-300"
            />
          </div>
          <Button className="whitespace-nowrap rounded-full bg-white px-8 py-6 text-blue-600 shadow-lg hover:bg-gray-100 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400">
            Search Events
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm dark:justify-start dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-300 dark:text-amber-300" />
            <span>1000+ Events</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-300 dark:text-amber-300" />
            <span>50K+ Attendees</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 dark:text-amber-300" />
            <span>Trusted by 200+ Organizers</span>
          </div>
        </div>
      </div>
    </section>
  );
};