"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminDeleteBrand, adminQuickEditBrand } from "@/actions/admin/brand.actions";
import { Checkbox } from "@/components/ui/checkbox";

export function BrandRowActions({ brand }: { brand: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: brand.name || "",
    slug: brand.slug || "",
    isActive: brand.isActive !== false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickEdit = () => {
    if (!formData.name.trim()) return;
    
    startTransition(async () => {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('slug', formData.slug);
      form.append('isActive', String(formData.isActive));
      if (imageFile) {
        form.append('image', imageFile);
      }

      const res = await adminQuickEditBrand(brand._id, form);
      if (res.error) {
        alert(res.error);
      } else {
        setIsEditModalOpen(false);
      }
    });
  };

  const handleDeleteBrand = () => {
    startTransition(async () => {
      const res = await adminDeleteBrand(brand._id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteModalOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => window.open(`/admin/studio/intent/edit/id=${brand._id};type=brand`, '_self')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Full Edit (Studio)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => {
              setFormData({
                name: brand.name || "",
                slug: brand.slug || "",
                isActive: brand.isActive !== false,
              });
              setImageFile(null);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Quick Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Brand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Edit Brand</DialogTitle>
            <DialogDescription>
              Update basic details for <strong>{brand.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right text-xs">Logo</Label>
              <Input 
                id="image" 
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                className="col-span-3 text-xs" 
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Slug</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                className="col-span-3" 
                disabled={isPending}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">Status</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  disabled={isPending}
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">{formData.isActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleQuickEdit} disabled={isPending || !formData.name.trim()}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {brand.name}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this brand? This cannot be undone. 
              You can only delete brands that are not currently assigned to any products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button variant="destructive" onClick={handleDeleteBrand} disabled={isPending}>
              {isPending ? "Deleting..." : "Yes, delete brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
