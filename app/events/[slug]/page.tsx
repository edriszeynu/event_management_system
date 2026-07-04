"use client";

import { notFound, useRouter } from 'next/navigation';
import { use, useState, useEffect, useReducer } from 'react';
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
  CheckCircle,
  CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { events } from '@/data/events';

// ---------- Cart Reducer ----------
type CartItem = {
  tierId: string;
  name: string;
  price: number;
  quantity: number;
  max: number;
};

type CartState = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

type CartAction =
  | { type: 'ADD'; payload: { tierId: string; name: string; price: number; max: number; qty: number } }
  | { type: 'REMOVE'; payload: { tierId: string } }
  | { type: 'UPDATE'; payload: { tierId: string; qty: number } }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.tierId === action.payload.tierId);
      let newItems;
      if (existing) {
        newItems = state.items.map((i) =>
          i.tierId === action.payload.tierId
            ? { ...i, quantity: Math.min(i.quantity + action.payload.qty, i.max) }
            : i
        );
      } else {
        newItems = [
          ...state.items,
          {
            tierId: action.payload.tierId,
            name: action.payload.name,
            price: action.payload.price,
            quantity: action.payload.qty,
            max: action.payload.max,
          },
        ];
      }
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      return { items: newItems, total, itemCount };
    }
    case 'REMOVE': {
      const newItems = state.items.filter((i) => i.tierId !== action.payload.tierId);
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      return { items: newItems, total, itemCount };
    }
    case 'UPDATE': {
      const newItems = state.items.map((i) =>
        i.tierId === action.payload.tierId
          ? { ...i, quantity: Math.min(Math.max(1, action.payload.qty), i.max) }
          : i
      );
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
      return { items: newItems, total, itemCount };
    }
    case 'CLEAR':
      return { items: [], total: 0, itemCount: 0 };
    default:
      return state;
  }
}

// ---------- Main Component ----------
export default function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const event = events.find((e) => e.slug === slug);
  if (!event) return notFound();

  const { toast } = useToast();

  // Cart
  const [cartState, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  // Local quantities for each tier
  const [quantities, setQuantities] = useState<Record<string, number>>(
    event.ticketTiers.reduce((acc, tier) => ({ ...acc, [tier.id]: 1 }), {})
  );

  // Checkout dialog state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'payment' | 'confirmation'>('review');

  const isVirtual = event.eventType === 'VIRTUAL';
  const eventDate = format(new Date(event.startDate), 'EEEE, MMM d, yyyy');
  const eventTime = format(new Date(event.startDate), 'h:mm a');
  const endTime = format(new Date(event.endDate), 'h:mm a');

  // Countdown
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
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
  }, [event.startDate]);

  // Handlers
  const handleQuantityChange = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const newVal = Math.max(1, (prev[tierId] || 1) + delta);
      const tier = event.ticketTiers.find((t) => t.id === tierId);
      const max = tier ? tier.quantityTotal - tier.quantitySold : 1;
      return { ...prev, [tierId]: Math.min(newVal, max) };
    });
  };

  const handleAddToCart = (tierId: string) => {
    const qty = quantities[tierId] || 1;
    const tier = event.ticketTiers.find((t) => t.id === tierId);
    if (!tier) return;
    const max = tier.quantityTotal - tier.quantitySold;
    const actualQty = Math.min(qty, max);
    if (actualQty <= 0) {
      toast({ title: 'Sold out', description: 'No tickets available.', variant: 'destructive' });
      return;
    }
    dispatch({
      type: 'ADD',
      payload: {
        tierId: tier.id,
        name: tier.name,
        price: tier.price,
        max,
        qty: actualQty,
      },
    });
    toast({
      title: 'Added to cart',
      description: `${actualQty} × ${tier.name} added.`,
      variant: 'success',
    });
  };

  const handleRemoveFromCart = (tierId: string) => {
    dispatch({ type: 'REMOVE', payload: { tierId } });
    toast({ title: 'Removed', description: 'Item removed from cart.' });
  };

  const handleUpdateCart = (tierId: string, qty: number) => {
    dispatch({ type: 'UPDATE', payload: { tierId, qty } });
  };

  const handleCheckout = () => {
    if (cartState.itemCount === 0) {
      toast({ title: 'Cart empty', description: 'Please add tickets first.', variant: 'destructive' });
      return;
    }
    setCheckoutOpen(true);
    setCheckoutStep('review');
  };

  const handlePayment = () => {
    setCheckoutStep('payment');
    setTimeout(() => {
      setCheckoutStep('confirmation');
      dispatch({ type: 'CLEAR' });
      toast({ title: '🎉 Order confirmed!', description: 'Your tickets are on the way.', variant: 'success' });
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied!', description: 'Share it with your friends.' });
    }
  };

  const handleAddToCalendar = () => {
    toast({ title: 'Calendar invite', description: 'Download .ics file (placeholder).' });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Floating cart button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white relative">
              <ShoppingCart className="h-5 w-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex-1 overflow-y-auto">
              {cartState.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cartState.items.map((item) => (
                    <div key={item.tierId} className="flex items-center gap-4 border-b pb-4">
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateCart(item.tierId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateCart(item.tierId, item.quantity + 1)}
                          disabled={item.quantity >= item.max}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleRemoveFromCart(item.tierId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${cartState.total.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

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
      <section className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-[28rem] w-full md:h-[34rem]">
          <Image
            src={event.bannerImage}
            alt={event.title}
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
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
        <div className="space-y-8">
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
                  {event.speakers.map((speaker) => (
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
                  {event.sessions.map((session) => {
                    const speaker = event.speakers?.find((s) => s.id === session.speakerId);
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
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card className="border-0 shadow-xl shadow-primary/10">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tickets</p>
                  <p className="text-2xl font-bold">Select Your Pass</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.ticketTiers.reduce((sum, t) => sum + t.quantitySold, 0)} sold
                </Badge>
              </div>

              <div className="space-y-4">
                {event.ticketTiers.map((tier) => {
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
                              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition"
                              onClick={() => handleAddToCart(tier.id)}
                            >
                              Add to Cart
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={handleCheckout}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Checkout ({cartState.itemCount} items)
              </Button>
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