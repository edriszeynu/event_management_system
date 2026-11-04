"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { items, clearCart } = useCartStore();
  const { user, _hasHydrated } = useAuthStore();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Wait for auth to hydrate
      if (!_hasHydrated) {
        return;
      }

      if (!sessionId) {
        setError("Invalid payment session");
        setProcessing(false);
        return;
      }

      if (!user) {
        setError("Please log in to complete your purchase");
        setProcessing(false);
        return;
      }

      // Use cart items still in localStorage
      if (items.length === 0) {
        // Already processed (cart cleared), just show success
        setProcessing(false);
        return;
      }

      try {
        for (const item of items) {
          const response = await fetch("/api/events/" + item.eventSlug + "/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketTierId: item.tierId,
              quantity: item.quantity,
            }),
          });

          if (!response.ok) {
            let errorMsg = "Failed to create registration";
            try {
              const err = await response.json();
              errorMsg = err.error || errorMsg;
            } catch {
              errorMsg = `Registration failed with status ${response.status}`;
            }
            throw new Error(errorMsg);
          }
        }

        clearCart();
        setProcessing(false);
      } catch (err: any) {
        console.error("Error processing payment:", err);
        setError(err.message || "Failed to process your tickets. Please contact support.");
        setProcessing(false);
      }
    };

    processPayment();
  }, [sessionId, _hasHydrated]); // wait for auth hydration

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Processing your order...</h2>
            <p className="text-muted-foreground">Please wait while we set up your tickets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/cart">
              <Button>Return to Cart</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground">Thank you for your purchase</p>
        </div>
        <CardContent className="pt-8">
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li>✓ Your tickets have been issued</li>
                <li>✓ A confirmation email has been sent to {user?.email}</li>
                <li>✓ Access your tickets anytime in your dashboard</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/attendee/tickets" className="w-full">
                <Button className="w-full h-11 font-semibold">View My Tickets</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full h-11 font-semibold">
                  Browse More Events
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment status...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
