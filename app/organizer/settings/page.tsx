"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { ProfileForm } from "@/components/organizer/ProfileForm";
import { PasswordForm } from "@/components/organizer/PasswordForm";
import { AvatarUpload } from "@/components/organizer/AvatarUpload";
import { User, Lock, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-blue-100 mt-0.5">Manage your profile, security, and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-base font-semibold mb-1">Profile Photo</h2>
                <p className="text-sm text-muted-foreground mb-5">Your photo will appear on your public profile</p>
                <div className="flex items-center gap-6">
                  <AvatarUpload currentAvatar={user?.avatar} />
                  <div>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile form card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-base font-semibold mb-1">Personal Information</h2>
                <p className="text-sm text-muted-foreground mb-5">Update your name and contact details</p>
                <ProfileForm user={user} />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Change Password</h2>
                  <p className="text-sm text-muted-foreground">Use a strong password to keep your account secure</p>
                </div>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <PasswordForm />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Choose how you receive notifications</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "New registrations", desc: "Get notified when someone registers for your event" },
                  { label: "Event reminders", desc: "Receive reminders before your events start" },
                  { label: "Payment alerts", desc: "Alerts for ticket sales and refunds" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      className="relative h-6 w-11 rounded-full bg-primary transition-colors focus-visible:outline-none"
                      role="switch"
                      aria-checked="true"
                    >
                      <span className="block h-4 w-4 rounded-full bg-white shadow translate-x-6 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Full notification preferences coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
