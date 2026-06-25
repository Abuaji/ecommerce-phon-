"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 

} from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { adminDeleteProduct, adminQuickEditProduct } from "@/actions/admin/product.actions";
// import Link from "next/link";
import { useTransition } from "react";


export function ProductRowActions({ product }: { product: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name || "",
    price: product.price || 0,
    category: product.category || "",
    brand: product.brand || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickEdit = () => {
    if (!formData.name.trim() || !formData.category.trim()) return;
    
    startTransition(async () => {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', String(formData.price));
      form.append('category', formData.category);
      form.append('brand', formData.brand);
      if (imageFile) {
        form.append('image', imageFile);
      }

      const res = await adminQuickEditProduct(product._id, form);
      if (res.error) {
        alert(res.error);
      } else {
        setIsEditModalOpen(false);
      }
    });
  };

  const handleDeleteProduct = () => {
    startTransition(async () => {
      const res = await adminDeleteProduct(product._id);
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
            onClick={() => window.open(`/admin/studio/intent/edit/id=${product._id};type=product`, '_self')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Full Edit (Studio)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => {
              setFormData({
                name: product.name || "",
                price: product.price || 0,
                category: product.category || "",
                brand: product.brand || "",
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
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Edit Product</DialogTitle>
            <DialogDescription>
              Update basic details for <strong>{product.name}</strong>. For full descriptions and galleries, use the Studio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right text-xs">Main Image</Label>
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
              <Label htmlFor="price" className="text-right">Price (₹)</Label>
              <Input 
                id="price" 
                type="number"
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Brand</Label>
              <Input 
                id="brand" 
                value={formData.brand} 
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleQuickEdit} disabled={isPending || !formData.name.trim() || !formData.category.trim()}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete <strong>{product.name}</strong> from Sanity and remove its stock records from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isPending}>
              {isPending ? "Deleting..." : "Yes, delete product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
