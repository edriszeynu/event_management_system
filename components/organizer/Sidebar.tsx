"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/organizer", icon: LayoutDashboard, label: "Overview" },
  { href: "/organizer/events", icon: Calendar, label: "Events" },
  { href: "/organizer/registrations", icon: Ticket, label: "Registrations" },
  { href: "/organizer/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/organizer/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link href="/organizer" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calendar className="h-6 w-6" />
          EventHub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Organizer Dashboard</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
