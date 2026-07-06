"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, UserCog, Lock, Unlock } from "lucide-react";
import { DeleteEventDialog } from "@/components/organizer/DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function UserTable({ users, loading, total, page, onPageChange, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "User deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.isActive ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Success", description: `User ${newStatus.toLowerCase()}`, variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  return (
    <>
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.isActive ? (
                            <><Lock className="mr-2 h-4 w-4" /> Deactivate</>
                          ) : (
                            <><Unlock className="mr-2 h-4 w-4" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedUser && (
        <DeleteEventDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={`${selectedUser.firstName} ${selectedUser.lastName}`}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
