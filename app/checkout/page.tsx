"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowLeft, Package, CreditCard, MapPin } from "lucide-react";
import Link from "next/link";

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP is required"),
});

type ShippingData = z.infer<typeof shippingSchema>;

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: "shipping" | "payment" | "confirmation" }) => {
  const steps = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "confirmation", label: "Confirmation", icon: CheckCircle },
  ];

  const getStepIndex = (step: string) => steps.findIndex(s => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                  style={{ marginBottom: "32px" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const onShippingSubmit = async (data: ShippingData) => {
    setShippingData(data);
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!shippingData) return;
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: shippingData,
          total,
        }),
      });
      const { sessionId, url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // If cart is empty, redirect
  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Explore our events and add tickets to get started.</p>
          <Link href="/">
            <Button size="lg">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Cart</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Secure Checkout
          </h1>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
                  <CardTitle className="text-2xl">Shipping Information</CardTitle>
                  <CardDescription>Enter your details to complete the order</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <Form {...form} onSubmit={form.handleSubmit(onShippingSubmit)}>
                    {/* Names Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Main Street"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="New York"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">State/Province</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="NY"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ZIP Code */}
                    <div className="mb-8">
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-semibold">ZIP/Postal Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10001"
                                className="h-11 bg-input border-border hover:border-muted-foreground/70 focus:border-ring dark:bg-input/80"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full h-12 text-base font-semibold">
                      Continue to Payment
                    </Button>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
                  <CardTitle className="text-2xl">Payment Method</CardTitle>
                  <CardDescription>Complete your payment securely through Stripe</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    {/* Shipping Summary */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                      <h3 className="font-semibold text-foreground mb-3">Shipping To</h3>
                      <div className="text-sm text-foreground space-y-1">
                        <p>{shippingData?.firstName} {shippingData?.lastName}</p>
                        <p>{shippingData?.address}</p>
                        <p>{shippingData?.city}, {shippingData?.state} {shippingData?.zip}</p>
                        <p className="text-muted-foreground mt-2">{shippingData?.email}</p>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">🔒 Secure Payment</span>
                        <br />
                        Your payment is processed securely through Stripe. Your card information is never stored on our servers.
                      </p>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Accepted Payment Methods</h3>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { name: "Visa", color: "bg-blue-600" },
                          { name: "Mastercard", color: "bg-red-600" },
                          { name: "Amex", color: "bg-blue-500" },
                          { name: "PayPal", color: "bg-blue-700" },
                        ].map((method) => (
                          <div
                            key={method.name}
                            className={`${method.color} rounded-lg h-12 w-20 flex items-center justify-center text-white text-xs font-semibold`}
                          >
                            {method.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <div className="p-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep("shipping")}
                    className="h-11"
                  >
                    Back to Shipping
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="h-11 px-8 font-semibold"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {step === "confirmation" && (
              <Card className="border-0 shadow-lg overflow-hidden">
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
                        <li>✓ A confirmation email has been sent to {shippingData?.email}</li>
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
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== "confirmation" && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-6">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {/* Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.tierId} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Total */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">Free</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">Calculated at checkout</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center bg-primary/5 px-4 py-3 rounded-lg">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 text-xs text-muted-foreground text-center">
                      🔒 All transactions are secure and encrypted
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}