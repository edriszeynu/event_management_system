"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/attendee/ProfileForm";
import { PasswordForm } from "@/components/attendee/PasswordForm";
import { AvatarUpload } from "@/components/attendee/AvatarUpload";
import { useAuthStore } from "@/stores/auth";
import { User, Lock, Shield, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [active, setActive] = useState("profile");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <AvatarUpload currentAvatar={user?.avatar} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5 text-sm text-white/80">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </span>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                <Shield className="h-3 w-3 mr-1" />
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="flex lg:flex-col gap-2 lg:w-48">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left",
                active === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content card */}
        <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            {(() => {
              const tab = tabs.find((t) => t.id === active)!;
              return (
                <>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold">{tab.label} Settings</p>
                </>
              );
            })()}
          </div>

          <div className="p-6">
            {active === "profile" && <ProfileForm user={user} />}
            {active === "security" && <PasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
