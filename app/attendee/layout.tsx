"use client";

import { useAuthStore } from "@/stores/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/attendee/Sidebar";
import { Header } from "@/components/organizer/Header";
import { MobileNav } from "@/components/organizer/MobileNav";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Overview";
    const last = segments[segments.length - 1];
    if (last === "tickets") return "My Tickets";
    if (last === "profile") return "Profile";
    if (last === "notifications") return "Notifications";
    if (last === "history") return "Event History";
    return "Overview";
  };

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileNav open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={getPageTitle()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
