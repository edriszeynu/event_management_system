"use client";

import { notFound, useRouter } from 'next/navigation';
import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Share2,
  CalendarPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cart'; // ✅ Zustand store
import Link from 'next/link';

export default function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const { toast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState('');
  const [waitlistEntry, setWaitlistEntry] = useState<{ id: string; position: number } | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  // Zustand cart
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const cartItemCount = getItemCount();
  const cartTotal = getTotal();

  // Fetch event data
  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetch(`/api/events/${slug}/waitlist`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setWaitlistEntry(data.entry);
        }
      })
      .catch(() => undefined);
  }, [slug]);

  // Init quantities
  useEffect(() => {
    if (event?.ticketTiers) {
      setQuantities(
        event.ticketTiers.reduce((acc: Record<string, number>, tier: any) => ({ ...acc, [tier.id]: 1 }), {})
      );
    }
  }, [event]);

  // Countdown timer
  useEffect(() => {
    if (!event?.startDate) return;
    const interval = setInterval(() => {
      const diff = new Date(event.startDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Event started');
        clearInterval(interval);
      } else {
        setTimeLeft(formatDistanceToNow(new Date(event.startDate), { addSuffix: true }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event?.startDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!event) return notFound();

  const bannerImage = typeof event.bannerImage === 'string' ? event.bannerImage.trim() : '';
  const isVirtual = event.eventType === 'VIRTUAL';
  const eventSoldOut = event.ticketTiers.length > 0 && !event.ticketTiers.some(
    (tier: { status: string; quantitySold: number; quantityTotal: number }) =>
      tier.status === 'ACTIVE' && tier.quantitySold < tier.quantityTotal
  );
  const eventDate = format(new Date(event.startDate), 'EEEE, MMM d, yyyy');
  const eventTime = format(new Date(event.startDate), 'h:mm a');
  const endTime = format(new Date(event.endDate), 'h:mm a');

  // Handlers
  const handleQuantityChange = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const newVal = Math.max(1, (prev[tierId] || 1) + delta);
      const tier = event.ticketTiers.find((t: any) => t.id === tierId);
      const max = tier ? tier.quantityTotal - tier.quantitySold : 1;
      return { ...prev, [tierId]: Math.min(newVal, max) };
    });
  };

  const handleAddToCart = (tierId: string) => {
    const qty = quantities[tierId] || 1;
    const tier = event.ticketTiers.find((t: any) => t.id === tierId);
    if (!tier) return;
    const max = tier.quantityTotal - tier.quantitySold;
    const actualQty = Math.min(qty, max);
    if (actualQty <= 0) {
      toast({ title: 'Sold out', description: 'No tickets available.', variant: 'destructive' });
      return;
    }
    addItem({
      tierId: tier.id,
      name: tier.name,
      price: tier.price,
      quantity: actualQty,
      max: max,
      eventId: event.id,
      eventTitle: event.title,
      eventSlug: event.slug,
    });
    toast({
      title: 'Added to cart',
      description: `${actualQty} × ${tier.name} added.`,
      variant: 'success',
    });
  };

  const handleWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const response = await fetch(`/api/events/${slug}/waitlist`, {
        method: waitlistEntry ? 'DELETE' : 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update your waitlist entry');
      if (waitlistEntry) {
        setWaitlistEntry(null);
        setWaitlistJoined(false);
        toast({ title: 'Left waitlist', variant: 'success' });
      } else {
        setWaitlistJoined(true);
        toast({ title: 'Joined waitlist', description: 'You are in line for this event.', variant: 'success' });
        const statusResponse = await fetch(`/api/events/${slug}/waitlist`);
        if (statusResponse.ok) setWaitlistEntry((await statusResponse.json()).entry);
      }
    } catch (error) {
      toast({
        title: 'Waitlist update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleRemoveFromCart = (tierId: string) => {
    removeItem(tierId);
    toast({ title: 'Removed', description: 'Item removed from cart.' });
  };

  const handleUpdateCart = (tierId: string, qty: number) => {
    updateQuantity(tierId, qty);
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      toast({ title: 'Link copied', description: 'Event link copied to your clipboard.', variant: 'success' });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      toast({ title: 'Could not share event', description: 'Copy the page address and share it with your friends.', variant: 'destructive' });
    }
  };

  const handleAddToCalendar = () => {
    const escapeIcsText = (value: string) => value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
    const toIcsDate = (value: string) => new Date(value)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
    const location = isVirtual ? event.virtualLink || 'Online' : event.venueAddress || '';
    const calendarEvent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@eventhub`,
      `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
      `DTSTART:${toIcsDate(event.startDate)}`,
      `DTEND:${toIcsDate(event.endDate)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `URL:${window.location.href}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
    const file = new Blob([calendarEvent], { type: 'text/calendar;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${event.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    toast({ title: 'Calendar invite downloaded', description: 'Add the event to your calendar from the downloaded file.', variant: 'success' });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Floating cart button (links to /cart) */}
      <Link href="/cart">
        <div className="fixed bottom-6 right-6 z-50 cursor-pointer">
          <Button size="lg" className="rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </Link>

      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Browse All Events
      </Button>

      {/* Countdown banner */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-full px-6 w-fit">
        <Clock className="h-4 w-4" />
        <span>Event starts {timeLeft}</span>
      </div>

      {/* Hero */}
      <section className="event-detail-enter relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-[28rem] w-full md:h-[34rem]">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={event.title}
              fill
              className="event-image-settle object-cover brightness-[0.85]"
              priority
            />
          ) : (
            <div aria-hidden="true" className="h-full w-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 pt-8 text-white sm:px-10 lg:pb-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
              {event.category}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white backdrop-blur-sm">
              {event.eventType}
            </Badge>
            <span className="ml-auto flex items-center gap-1.5 text-sm text-white/80">
              <Users className="h-4 w-4" />
              {event.registrationsCount} registered
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-white/80 sm:text-lg">
            {event.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {eventDate} · {eventTime} – {endTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {isVirtual ? 'Virtual event' : event.venueAddress}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={handleAddToCalendar}
            >
              <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
            </Button>
          </div>
        </div>
      </section>

      {/* Main two‑column layout */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
        {/* Left column */}
        <div className="event-detail-enter event-detail-enter-late space-y-8">
          {/* About */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">About This Event</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {event.description} This event brings together industry experts, innovators, and enthusiasts for a day of learning, networking, and inspiration.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startDate), 'h:mm a')} – {endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">
                      {isVirtual ? 'Online (link provided after registration)' : event.venueAddress}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speakers (optional) */}
          {event.speakers && event.speakers.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight">Featured Speakers</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((speaker: any) => (
                    <div key={speaker.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={speaker.avatar} alt={speaker.name} />
                        <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{speaker.name}</p>
                        <p className="text-sm text-muted-foreground">{speaker.title} · {speaker.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda (optional) */}
          {event.sessions && event.sessions.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight">Event Schedule</h2>
                <div className="mt-4 space-y-4">
                  {event.sessions.map((session: any) => {
                    const speaker = event.speakers?.find((s: any) => s.id === session.speakerId);
                    return (
                      <div key={session.id} className="border-l-4 border-primary pl-4 py-2">
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.startTime), 'h:mm a')} –{' '}
                          {format(new Date(session.endTime), 'h:mm a')}
                        </p>
                        {speaker && <p className="text-sm">🎤 {speaker.name}</p>}
                        <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizer */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hosted by</p>
                  <p className="text-lg font-semibold">{event.organizer.firstName} {event.organizer.lastName}</p>
                  <a href={`mailto:${event.organizer.email}`} className="text-sm text-primary hover:underline">
                    {event.organizer.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column – Ticket sidebar */}
        <div className="event-detail-enter event-detail-enter-later lg:sticky lg:top-8 lg:self-start">
          <Card className="border-0 shadow-xl shadow-primary/10">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tickets</p>
                  <p className="text-2xl font-bold">Select Your Pass</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.ticketTiers.reduce((sum: number, t: any) => sum + t.quantitySold, 0)} sold
                </Badge>
              </div>

              <div className="space-y-4">
                {event.ticketTiers.map((tier: any) => {
                  const qty = quantities[tier.id] || 1;
                  const maxAvailable = tier.quantityTotal - tier.quantitySold;
                  const isSoldOut = maxAvailable <= 0;
                  return (
                    <div
                      key={tier.id}
                      className={`group relative rounded-xl border-2 p-4 transition-all ${
                        isSoldOut
                          ? 'border-red-200 bg-red-50/50 opacity-60'
                          : 'border-muted hover:border-primary/50 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{tier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isSoldOut ? 'Sold out' : `${tier.quantitySold} of ${tier.quantityTotal} available`}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-primary">${tier.price.toFixed(2)}</p>
                      </div>
                      {!isSoldOut && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-lg border border-input">
                              <button
                                className="px-3 py-1 text-muted-foreground hover:bg-muted"
                                onClick={() => handleQuantityChange(tier.id, -1)}
                              >
                                −
                              </button>
                              <Input
                                type="number"
                                value={qty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val > 0 && val <= maxAvailable) {
                                    setQuantities((prev) => ({ ...prev, [tier.id]: val }));
                                  }
                                }}
                                min={1}
                                max={maxAvailable}
                                className="w-12 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                className="px-3 py-1 text-muted-foreground hover:bg-muted"
                                onClick={() => handleQuantityChange(tier.id, 1)}
                              >
                                +
                              </button>
                            </div>
                            <Button
                              className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 group-hover:shadow-md transition"
                              onClick={() => handleAddToCart(tier.id)}
                            >
                              Add to Cart
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                      {isSoldOut && eventSoldOut && (
                        <div className="mt-3 border-t pt-3">
                          <Button
                            variant={waitlistEntry ? 'outline' : 'default'}
                            className="w-full"
                            disabled={waitlistLoading || waitlistJoined}
                            onClick={handleWaitlist}
                          >
                            {waitlistLoading ? 'Updating...' : waitlistEntry ? `On waitlist · #${waitlistEntry.position} · Leave` : waitlistJoined ? 'Joined waitlist' : 'Join waitlist'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Link href="/cart">
                <Button
                  className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  View Cart ({cartItemCount} items)
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure checkout powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}