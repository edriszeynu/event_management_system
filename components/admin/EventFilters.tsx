"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

export function EventFilters({ search, onSearchChange, status, onStatusChange, category, onCategoryChange }: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by title or organizer..."
          className="h-11 pl-9 rounded-xl border-border bg-background/80 text-foreground placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={(value) => onStatusChange(value ?? "ALL")}>
        <SelectTrigger className="h-11 w-full rounded-xl border-border bg-background/80 text-foreground sm:w-[190px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft / Pending</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "ALL")}>
        <SelectTrigger className="h-11 w-full rounded-xl border-border bg-background/80 text-foreground sm:w-[190px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
          <SelectItem value="Business">Business</SelectItem>
          <SelectItem value="Health">Health</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
