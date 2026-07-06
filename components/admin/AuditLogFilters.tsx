"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function AuditLogFilters({ search, onSearchChange, action, onActionChange, dateRange, onDateRangeChange }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by admin email or action..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={action} onValueChange={onActionChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Actions</SelectItem>
          <SelectItem value="LOGIN">Login</SelectItem>
          <SelectItem value="LOGOUT">Logout</SelectItem>
          <SelectItem value="USER_CREATED">User Created</SelectItem>
          <SelectItem value="USER_DELETED">User Deleted</SelectItem>
          <SelectItem value="EVENT_CREATED">Event Created</SelectItem>
          <SelectItem value="EVENT_DELETED">Event Deleted</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Time</SelectItem>
          <SelectItem value="TODAY">Today</SelectItem>
          <SelectItem value="WEEK">Last 7 Days</SelectItem>
          <SelectItem value="MONTH">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
