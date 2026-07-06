"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AvatarUpload({ currentAvatar }: { currentAvatar?: string }) {
  const { toast } = useToast();
  const [avatar, setAvatar] = useState(currentAvatar);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate upload – replace with real upload logic
    toast({ title: "Upload", description: "Avatar upload will be implemented." });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          <Camera className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors">
        <Camera className="h-4 w-4" />
        Change Avatar
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
      </label>
    </div>
  );
}
