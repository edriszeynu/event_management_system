"use client";

import { useState } from "react";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Globe, CreditCard, Mail, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Globe, description: "Platform name, currency & timezone" },
  { id: "payment", label: "Payment", icon: CreditCard, description: "Fees, Stripe & PayPal keys" },
  { id: "email", label: "Email", icon: Mail, description: "SMTP configuration" },
  { id: "features", label: "Features", icon: Zap, description: "Toggle platform features" },
];

export default function SettingsPage() {
  const [active, setActive] = useState("general");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-56 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all w-full whitespace-nowrap",
                active === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:block">{tab.label}</span>
              <span className="lg:hidden">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <current.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{current.label} Settings</p>
              <p className="text-xs text-muted-foreground">{current.description}</p>
            </div>
          </div>
          <div className="p-6">
            <SettingsForm category={active} />
          </div>
        </div>
      </div>
    </div>
  );
}
