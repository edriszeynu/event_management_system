"use client";

import { useAuthStore } from "@/stores/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/organizer/Sidebar";
import { Header } from "@/components/organizer/Header";
import { MobileNav } from "@/components/organizer/MobileNav";

export default function OrganizerLayout({
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
    if (!isAuthenticated || (user?.role !== "ORGANIZER" && user?.role !== "SUPER_ADMIN")) {
      router.push("/login");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 2) return "Overview";
    const last = segments[segments.length - 1];
    if (last === "create") return "Create Event";
    if (last === "edit") return "Edit Event";
    if (last === "registrations") return "Registrations";
    if (last === "analytics") return "Analytics";
    if (last === "settings") return "Settings";
    if (last === "events") return "My Events";
    return "Overview";
  };

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "ORGANIZER" && user?.role !== "SUPER_ADMIN")) {
    return null;
  }

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
