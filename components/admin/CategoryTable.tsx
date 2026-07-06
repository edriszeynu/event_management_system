"use client";

import { useState } from "react";
import Link from "next/link";
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
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { DeleteEventDialog } from "@/components/organizer/DeleteEventDialog";
import { useToast } from "@/hooks/use-toast";

export function CategoryTable({ categories, loading, onRefresh }: any) {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/categories/${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Category deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  if (loading) {
    return <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
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
              <TableHead>Slug</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Events</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.icon || "📁"}</TableCell>
                  <TableCell>{cat._count?.events || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/admin/categories/${cat.id}/edit`} />}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelected(cat);
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
      {selected && (
        <DeleteEventDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={selected.name}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
