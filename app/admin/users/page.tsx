"use client";

import { useState, useEffect } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        role: role !== "ALL" ? role : "",
        status: status !== "ALL" ? status : "",
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, status]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
      />
      <UserTable
        users={users}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
