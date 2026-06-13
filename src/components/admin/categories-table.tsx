"use client";

import { useState, useTransition } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Search, Loader2, FolderTree } from "lucide-react";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import {
  adminDeleteCategory,
  adminBulkDeleteCategories,
  CategoryDoc,
} from "@/actions/admin/category.actions";

export function CategoriesTable({ categories }: { categories: CategoryDoc[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDoc | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c._id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      filtered.forEach((c) => next.delete(c._id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((c) => next.add(c._id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDelete = (cat: CategoryDoc) => {
    setErrorMsg(null);
    setDeleteTarget(cat);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await adminDeleteCategory(deleteTarget._id);
      if (result.error) {
        setErrorMsg(result.error);
      }
      setDeleteTarget(null);
    });
  };

  const confirmBulkDelete = () => {
    startTransition(async () => {
      const ids = Array.from(selected);
      const result = await adminBulkDeleteCategories(ids);
      if (result.failedCount > 0) {
        setErrorMsg(
          `${result.deletedCount} deleted. ${result.failedCount} failed: ${result.errors.join("; ")}`
        );
      }
      setSelected(new Set());
      setBulkDeleteOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete ({selected.size}) Selected
            </Button>
          )}
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FolderTree className="h-8 w-8 text-muted-foreground/40" />
                    <span>No categories found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((cat) => (
              <TableRow key={cat._id} className={selected.has(cat._id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(cat._id)}
                    onCheckedChange={() => toggleOne(cat._id)}
                    aria-label={`Select ${cat.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-9 w-9 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      {cat.isFeatured && (
                        <span className="text-xs text-amber-500">★ Featured</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {cat.slug}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cat.parentName || <span className="italic text-xs">Top-level</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {cat.productCount} products
                  </Badge>
                </TableCell>
                <TableCell>
                  {cat.isActive ? (
                    <Badge variant="secondary" className="text-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {cat.displayOrder}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(cat)}
                      title="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(cat)}
                      title="Delete category"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {categories.length} categories
        {selected.size > 0 && ` · ${selected.size} selected`}
      </p>

      {/* Create Modal */}
      <CategoryFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        allCategories={categories}
      />

      {/* Edit Modal */}
      <CategoryFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        editTarget={editTarget}
        allCategories={categories}
      />

      {/* Single Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</DialogTitle>
            <DialogDescription>
              This will permanently delete this category from Sanity. This action cannot be undone.
              {deleteTarget?.productCount && deleteTarget.productCount > 0 ? (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠ This category has {deleteTarget.productCount} product(s). You must reassign them first.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending || (deleteTarget?.productCount ?? 0) > 0}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected.size} Categories?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selected.size} selected categories. Categories with
              active products will be skipped and you&apos;ll see an error summary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete All Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
