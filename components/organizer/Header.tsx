"use client";

import { Menu, Search } from "lucide-react";
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
}

export function Header({ title, onMenuClick }: HeaderProps) {
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/organizer/settings" />}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
