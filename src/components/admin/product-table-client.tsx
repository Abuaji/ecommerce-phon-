"use client";

import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { adminBulkDeleteProducts, adminBulkUpdateCategory, adminBulkUpdateBrand } from "@/actions/admin/product.actions";
import { Trash2, Edit } from "lucide-react";

export function ProductTableClient({ products }: { products: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [isBulkBrandModalOpen, setIsBulkBrandModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkDelete = () => {
    startTransition(async () => {
      const res = await adminBulkDeleteProducts(selectedIds);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      }
    });
  };

  const handleBulkCategory = () => {
    if (!bulkCategory.trim()) return;
    startTransition(async () => {
      const res = await adminBulkUpdateCategory(selectedIds, bulkCategory);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
        setIsBulkCategoryModalOpen(false);
        setBulkCategory("");
      }
    });
  };

  const handleBulkBrand = () => {
    if (!bulkBrand.trim()) return;
    startTransition(async () => {
      const res = await adminBulkUpdateBrand(selectedIds, bulkBrand);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
        setIsBulkBrandModalOpen(false);
        setBulkBrand("");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium mr-4">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => setIsBulkCategoryModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Category
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBulkBrandModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Brand
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] pl-6">
                <Checkbox 
                  checked={selectedIds.length === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product._id} className={selectedIds.includes(product._id) ? "bg-muted/30" : ""}>
                <TableCell className="pl-6">
                  <Checkbox 
                    checked={selectedIds.includes(product._id)}
                    onCheckedChange={(c) => handleSelectOne(product._id, !!c)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border">N/A</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>₹{product.price?.toLocaleString()}</TableCell>
                <TableCell className="text-right pr-6">
                  <ProductRowActions product={product} />
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found. Click "Open Sanity Studio" to add your first product!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Modals */}
      <Dialog open={isBulkCategoryModalOpen} onOpenChange={setIsBulkCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Category</DialogTitle>
            <DialogDescription>
              Update the category for {selectedIds.length} selected products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulkCategory" className="text-right">New Category</Label>
              <Input 
                id="bulkCategory" 
                value={bulkCategory} 
                onChange={(e) => setBulkCategory(e.target.value)} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleBulkCategory} disabled={isPending || !bulkCategory.trim()}>
              {isPending ? "Saving..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkBrandModalOpen} onOpenChange={setIsBulkBrandModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Brand</DialogTitle>
            <DialogDescription>
              Update the brand for {selectedIds.length} selected products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bulkBrand" className="text-right">New Brand</Label>
              <Input 
                id="bulkBrand" 
                value={bulkBrand} 
                onChange={(e) => setBulkBrand(e.target.value)} 
                className="col-span-3" 
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleBulkBrand} disabled={isPending || !bulkBrand.trim()}>
              {isPending ? "Saving..." : "Update Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} Products?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected products from Sanity and your database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Yes, delete them"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
