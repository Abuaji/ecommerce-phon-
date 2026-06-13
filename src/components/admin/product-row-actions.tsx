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
import { adminDeleteProduct, adminUpdateProductCategory } from "@/actions/admin/product.actions";
import Link from "next/link";
import { useTransition } from "react";


export function ProductRowActions({ product }: { product: any }) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState(product.category || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdateCategory = () => {
    if (!categoryInput.trim()) return;
    
    startTransition(async () => {
      const res = await adminUpdateProductCategory(product._id, categoryInput.trim());
      if (res.error) {
        alert(res.error);
      } else {
        setIsCategoryModalOpen(false);
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
          <Link href={`/admin/studio`}>
            <DropdownMenuItem className="cursor-pointer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Edit in Studio
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            onSelect={() => {
              setCategoryInput(product.category || "");
              setIsCategoryModalOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Category
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600"
            onSelect={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category for <strong>{product.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input 
                id="category" 
                value={categoryInput} 
                onChange={(e) => setCategoryInput(e.target.value)} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleUpdateCategory} disabled={isPending || !categoryInput.trim()}>
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
