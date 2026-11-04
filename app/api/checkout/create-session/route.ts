import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

type RequestedCartItem = { tierId: string; quantity: number };

function isRequestedCartItem(item: unknown): item is RequestedCartItem {
  return typeof item === "object" && item !== null &&
    "tierId" in item && typeof item.tierId === "string" &&
    "quantity" in item && Number.isInteger(item.quantity) && item.quantity === 1;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(["ATTENDEE"]);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null || !("items" in body) || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }
    const rawItems: unknown[] = body.items;
    if (rawItems.length === 0 || !rawItems.every(isRequestedCartItem)) {
      return NextResponse.json({ error: "Each event currently supports one ticket per attendee" }, { status: 400 });
    }
    const items = rawItems;

    const tierIds = items.map((item) => item.tierId);
    if (new Set(tierIds).size !== tierIds.length) {
      return NextResponse.json({ error: "Cart contains duplicate ticket tiers" }, { status: 400 });
    }

    const tiers = await prisma.ticketTier.findMany({
      where: { id: { in: tierIds } },
      include: { event: true },
    });
    if (tiers.length !== items.length) {
      return NextResponse.json({ error: "One or more tickets are unavailable" }, { status: 400 });
    }
    if (new Set(tiers.map((tier) => tier.eventId)).size !== tiers.length) {
      return NextResponse.json({ error: "Only one ticket tier per event is currently supported" }, { status: 400 });
    }

    const now = new Date();
    for (const tier of tiers) {
      if (
        tier.event.status !== "PUBLISHED" || tier.status !== "ACTIVE" ||
        tier.salesStart > now || tier.salesEnd < now || tier.quantitySold >= tier.quantityTotal
      ) {
        return NextResponse.json({ error: `Tickets are not available for ${tier.event.title}` }, { status: 409 });
      }
      const registration = await prisma.registration.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: tier.eventId } },
      });
      if (registration) {
        return NextResponse.json({ error: `You are already registered for ${tier.event.title}` }, { status: 409 });
      }
      if (tier.price <= 0) {
        return NextResponse.json({ error: "Free tickets should be claimed through event registration" }, { status: 400 });
      }
    }

    // Build line items for Stripe
    const lineItems = items.map((item) => {
      const tier = tiers.find((candidate) => candidate.id === item.tierId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tier.event.title} - ${tier.name}`,
            description: `Ticket for ${tier.event.title}`,
          },
          unit_amount: Math.round(tier.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const checkoutItems = items.map((item) => {
      const tier = tiers.find((candidate) => candidate.id === item.tierId)!;
      return {
        tierId: tier.id,
        eventId: tier.eventId,
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: {
        userId: user.id,
        cartItems: JSON.stringify(checkoutItems),
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create checkout session", details: errorMessage },
      { status: 500 }
    );
  }
}