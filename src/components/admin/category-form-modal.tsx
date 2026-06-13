"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { adminCreateCategory, adminUpdateCategory, CategoryDoc } from "@/actions/admin/category.actions";

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  editTarget?: CategoryDoc | null;
  allCategories: CategoryDoc[];
};

export function CategoryFormModal({
  open,
  onClose,
  editTarget,
  allCategories,
}: CategoryFormModalProps) {
  const isEdit = !!editTarget;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(editTarget?.name || "");
  const [description, setDescription] = useState(editTarget?.description || "");
  const [isActive, setIsActive] = useState(editTarget?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(editTarget?.isFeatured ?? false);
  const [displayOrder, setDisplayOrder] = useState(String(editTarget?.displayOrder ?? 0));
  const [parentId, setParentId] = useState(editTarget?.parentId || "");
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      isActive,
      isFeatured,
      displayOrder: parseInt(displayOrder) || 0,
      ...(parentId && parentId !== "none" ? { parentId } : {}),
    };

    startTransition(async () => {
      const result = isEdit
        ? await adminUpdateCategory(editTarget!._id, payload)
        : await adminCreateCategory(payload);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  // Filter out the category being edited from parent options
  const parentOptions = allCategories.filter(
    (c) => c._id !== editTarget?._id && (!c.parentId) // only top-level as parents
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update category details. Changes apply immediately to the storefront."
              : "Create a new category. It will be immediately available in the storefront."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Phone Cases"
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this category..."
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="cat-parent">Parent Category (optional)</Label>
            <Select value={parentId || "none"} onValueChange={(v: string | null) => setParentId(v && v !== "none" ? v : "")} disabled={isPending}>
              <SelectTrigger id="cat-parent">
                <SelectValue placeholder="None (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top-level)</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="cat-order">Display Order</Label>
            <Input
              id="cat-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="0"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first in the storefront.</p>
          </div>

          {/* Toggles Row */}
          <div className="flex gap-6 pt-1">
            <div className="flex items-center gap-3">
              <Checkbox
                id="cat-active"
                checked={isActive}
                onCheckedChange={(v) => setIsActive(!!v)}
                disabled={isPending}
              />
              <Label htmlFor="cat-active">Active (visible in store)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="cat-featured"
                checked={isFeatured}
                onCheckedChange={(v) => setIsFeatured(!!v)}
                disabled={isPending}
              />
              <Label htmlFor="cat-featured">Featured</Label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
