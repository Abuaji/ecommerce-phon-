"use client";

import { useState } from "react";
import { adminGetCoupons } from "@/actions/admin/coupon.actions";
import { CouponFormModal } from "@/components/admin/coupon-form-modal";
import { CouponToggle, CouponDeleteButton } from "@/components/admin/coupon-row-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Tag } from "lucide-react";

type Coupon = Awaited<ReturnType<typeof adminGetCoupons>>[0];

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing — Coupons</h1>
            <p className="text-muted-foreground">Create and manage discount coupons for your store.</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {showModal && <CouponFormModal onClose={() => setShowModal(false)} />}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Used / Limit</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <span className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">{coupon.code}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{coupon.discountType}</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `₹${(coupon.discountValue / 100).toLocaleString()}`}
                  {coupon.maxDiscount && (
                    <span className="text-xs text-muted-foreground ml-1">(max ₹{(coupon.maxDiscount / 100).toLocaleString()})</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {coupon.minOrderValue ? `₹${(coupon.minOrderValue / 100).toLocaleString()}` : "—"}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{coupon._count.redemptions} / {coupon.usageLimit ?? "∞"}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString("en-IN") : "Never"}
                </TableCell>
                <TableCell>
                  <CouponToggle couponId={coupon.id} isActive={coupon.isActive} />
                </TableCell>
                <TableCell>
                  <CouponDeleteButton couponId={coupon.id} />
                </TableCell>
              </TableRow>
            ))}
            {initialCoupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No coupons yet. Click "New Coupon" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
