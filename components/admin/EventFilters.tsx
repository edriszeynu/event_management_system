"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function EventFilters({ search, onSearchChange, status, onStatusChange, category, onCategoryChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by title or organizer..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
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
