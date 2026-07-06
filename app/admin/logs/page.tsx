"use client";

import { useState, useEffect } from "react";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { AuditLogFilters } from "@/components/admin/AuditLogFilters";
import { useToast } from "@/hooks/use-toast";

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, action: action !== "ALL" ? action : "", dateRange });
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const normalizedLogs = Array.isArray(data) ? data : data?.logs ?? [];
      setLogs(normalizedLogs);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, action, dateRange]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <AuditLogFilters
        search={search}
        onSearchChange={setSearch}
        action={action}
        onActionChange={setAction}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <AuditLogTable logs={logs} loading={loading} onRefresh={fetchLogs} />
    </div>
  );
}
