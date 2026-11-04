import type { ReactNode } from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <section className="grid min-h-[calc(100svh-4rem)] bg-background text-foreground lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <aside
        role="img"
        aria-label="A crowd enjoying a live event"
        className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-[#173b36] bg-cover bg-center px-6 py-7 text-white sm:min-h-[290px] sm:px-10 sm:py-9 lg:min-h-[calc(100svh-4rem)] lg:px-14 lg:py-12"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(9, 30, 27, .34) 0%, rgba(9, 30, 27, .3) 42%, rgba(9, 30, 27, .88) 100%), url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=85')",
        }}
      >
        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5 text-sm font-semibold text-white">
          <span className="grid size-9 place-items-center rounded-lg bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <CalendarDays className="size-[18px]" />
          </span>
          EventHub
        </Link>

        <div className="relative z-10 max-w-xl pb-1 lg:pb-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c7e3cb] sm:mb-5">
            Your next great night starts here
          </p>
          <h2 className="max-w-[12ch] font-serif text-4xl leading-[1.04] sm:text-5xl lg:text-[4.25rem]">
            Find your people. Feel the moment.
          </h2>
          <div className="mt-5 hidden max-w-md items-center gap-3 border-l border-white/50 pl-4 text-sm leading-6 text-white/85 sm:flex lg:mt-8">
            <span>From intimate workshops to nights you will talk about for years.</span>
          </div>
        </div>

        <span className="absolute right-6 top-7 hidden items-center gap-1.5 text-xs font-medium text-white/80 sm:inline-flex lg:right-10 lg:top-10">
          Made for being there <ArrowUpRight className="size-3.5" />
        </span>
      </aside>

      <div className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="w-full max-w-[430px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-normal text-foreground sm:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-8 sm:mt-9">{children}</div>
          <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>
    </section>
  );
}