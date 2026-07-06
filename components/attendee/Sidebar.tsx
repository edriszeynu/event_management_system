"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  User,
  Bell,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/attendee", icon: LayoutDashboard, label: "Overview" },
  { href: "/attendee/tickets", icon: Ticket, label: "My Tickets" },
  { href: "/attendee/profile", icon: User, label: "Profile" },
  { href: "/attendee/notifications", icon: Bell, label: "Notifications" },
  { href: "/attendee/history", icon: History, label: "Event History" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link href="/attendee" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Ticket className="h-6 w-6" />
          EventHub
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Attendee Dashboard</p>
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
