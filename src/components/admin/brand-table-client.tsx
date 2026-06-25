"use client";

import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { adminBulkDeleteBrands, adminBulkUpdateBrandStatus } from "@/actions/admin/brand.actions";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { BrandRowActions } from "@/components/admin/brand-row-actions";

export function BrandTableClient({ brands }: { brands: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(brands.map(b => b._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(bId => bId !== id));
    }
  };

  const handleBulkDelete = () => {
    startTransition(async () => {
      const res = await adminBulkDeleteBrands(selectedIds);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      }
    });
  };

  const handleBulkStatusUpdate = (isActive: boolean) => {
    startTransition(async () => {
      const res = await adminBulkUpdateBrandStatus(selectedIds, isActive);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedIds([]);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium mr-4">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate(true)} disabled={isPending}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Set Active
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate(false)} disabled={isPending}>
            <XCircle className="w-4 h-4 mr-2" />
            Set Inactive
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)} disabled={isPending}>
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
                  checked={selectedIds.length === brands.length && brands.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand: any) => (
              <TableRow key={brand._id} className={selectedIds.includes(brand._id) ? "bg-muted/30" : ""}>
                <TableCell className="pl-6">
                  <Checkbox 
                    checked={selectedIds.includes(brand._id)}
                    onCheckedChange={(c) => handleSelectOne(brand._id, !!c)}
                    aria-label={`Select ${brand.name}`}
                  />
                </TableCell>
                <TableCell>
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="h-10 w-16 object-contain rounded-md bg-muted p-1" />
                  ) : (
                    <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border">No Logo</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{brand.slug || "—"}</TableCell>
                <TableCell>
                  <span className="font-semibold">{brand.productCount ?? 0}</span>
                  <span className="text-muted-foreground text-xs ml-1">products</span>
                </TableCell>
                <TableCell>
                  {brand.isActive !== false ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <BrandRowActions brand={brand} />
                </TableCell>
              </TableRow>
            ))}
            {(!brands || brands.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No brands found. Add brands in Sanity Studio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} Brands?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. You can only delete brands that are not currently assigned to any products.
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
