import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment is not complete" }, { status: 409 });
    }
    
    try {
      const { userId, cartItems } = session.metadata || {};
      
      if (!userId || !cartItems) {
        console.error("Missing metadata in session");
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const items: unknown = JSON.parse(cartItems);
      if (!Array.isArray(items) || items.some((item) =>
        typeof item !== "object" || item === null ||
        typeof item.eventId !== "string" || typeof item.tierId !== "string" || item.quantity !== 1
      )) {
        return NextResponse.json({ error: "Invalid cart metadata" }, { status: 400 });
      }

      // Create registrations for each ticket
      for (const item of items) {
        const tier = await prisma.ticketTier.findFirst({
          where: { id: item.tierId, eventId: item.eventId, status: "ACTIVE", event: { status: "PUBLISHED" } },
        });
        if (!tier) {
          console.error("Checkout metadata references an unavailable ticket tier");
          return NextResponse.json({ error: "Ticket is no longer available" }, { status: 409 });
        }

        const existingRegistration = await prisma.registration.findUnique({
          where: { userId_eventId: { userId, eventId: item.eventId } },
        });
        if (existingRegistration) continue;

        await prisma.registration.create({
          data: {
            userId: userId,
            eventId: item.eventId,
            ticketTierId: item.tierId,
            status: "CONFIRMED",
            qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        });

        // Update ticket tier sold count
        await prisma.ticketTier.update({
          where: { id: item.tierId },
          data: {
            quantitySold: {
              increment: item.quantity,
            },
          },
        });
      }

      console.log("Payment succeeded and registrations created for user:", userId);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}