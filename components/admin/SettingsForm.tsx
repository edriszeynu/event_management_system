"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

const schemas = {
  general: z.object({
    platformName: z.string().min(1),
    defaultCurrency: z.string().min(1),
    timezone: z.string().min(1),
    allowRegistration: z.boolean().default(true),
  }),
  payment: z.object({
    platformFee: z.number().min(0).max(100).default(0),
    stripeKey: z.string().optional(),
    paypalKey: z.string().optional(),
  }),
  email: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
  }),
  features: z.object({
    allowFreeEvents: z.boolean().default(true),
    allowVirtualEvents: z.boolean().default(true),
    enableWaitlist: z.boolean().default(true),
  }),
};

const fieldConfig: Record<string, { name: string; label: string; description?: string; type?: string }[]> = {
  general: [
    { name: "platformName", label: "Platform Name", description: "The public name of your platform" },
    { name: "defaultCurrency", label: "Default Currency", description: "e.g. USD, EUR, GBP" },
    { name: "timezone", label: "Timezone", description: "e.g. America/New_York, UTC" },
    { name: "allowRegistration", label: "Allow New Registrations", description: "Let new users sign up", type: "switch" },
  ],
  payment: [
    { name: "platformFee", label: "Platform Fee (%)", description: "Percentage fee on each ticket sale", type: "number" },
    { name: "stripeKey", label: "Stripe Secret Key", description: "From your Stripe dashboard", type: "password" },
    { name: "paypalKey", label: "PayPal Client ID", description: "From your PayPal developer portal" },
  ],
  email: [
    { name: "smtpHost", label: "SMTP Host", description: "e.g. smtp.gmail.com" },
    { name: "smtpPort", label: "SMTP Port", description: "Typically 587 or 465", type: "number" },
    { name: "smtpUser", label: "SMTP Username", description: "Your email address" },
    { name: "smtpPass", label: "SMTP Password", description: "App password or SMTP secret", type: "password" },
  ],
  features: [
    { name: "allowFreeEvents", label: "Free Events", description: "Allow organizers to create $0 events", type: "switch" },
    { name: "allowVirtualEvents", label: "Virtual Events", description: "Enable online/virtual event type", type: "switch" },
    { name: "enableWaitlist", label: "Waitlist", description: "Allow attendees to join a waitlist when sold out", type: "switch" },
  ],
};

export function SettingsForm({ category }: { category: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(schemas[category as keyof typeof schemas] || z.object({})),
    defaultValues: {},
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/settings?category=${category}`)
      .then((r) => r.json())
      .then((data) => { form.reset(data.settings || {}); })
      .catch(() => toast({ title: "Error", description: "Failed to load settings", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [category]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings?category=${category}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, settings: data }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Saved", description: "Settings updated successfully", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = fieldConfig[category] ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {fields.map((f) =>
          f.type === "switch" ? (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    {f.description && <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>}
                  </div>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          ) : (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <FormLabel className="text-sm font-medium">{f.label}</FormLabel>
                  {f.description && <p className="text-xs text-muted-foreground -mt-1 mb-1">{f.description}</p>}
                  <FormControl>
                    <Input
                      {...field}
                      type={f.type || "text"}
                      onChange={(e) =>
                        f.type === "number"
                          ? field.onChange(parseFloat(e.target.value))
                          : field.onChange(e.target.value)
                      }
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        )}

        <div className="pt-4">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
    </Form>
  );
}
