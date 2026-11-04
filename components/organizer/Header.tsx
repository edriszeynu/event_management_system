"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/app/components/common/ModeToggle";
import Link from "next/link";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ title, onMenuClick, onSidebarToggle, sidebarCollapsed = false }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          {onSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={onSidebarToggle}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-sm mx-4 hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 h-9 rounded-xl bg-muted/50 border-border focus:border-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full inline-flex items-center justify-center hover:bg-muted transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[290px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-0 shadow-2xl shadow-slate-950/60 backdrop-blur-xl sm:w-72">
              <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border-2 border-white/30">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="bg-white/20 text-sm font-semibold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-xs text-white/80">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-2">
                <DropdownMenuItem
                  onClick={() => router.push("/organizer/settings")}
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/organizer")}
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/8 focus:bg-white/8"
                >
                  Dashboard
                </DropdownMenuItem>
              </div>

              <div className="border-t border-border/60 p-2">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                  Logout
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
