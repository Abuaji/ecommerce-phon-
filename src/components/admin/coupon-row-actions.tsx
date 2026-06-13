"use client";

import { useState, useTransition } from "react";
import { adminToggleCoupon, adminDeleteCoupon } from "@/actions/admin/coupon.actions";
import { Trash2 } from "lucide-react";

export function CouponToggle({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const next = !active;
      setActive(next);
      await adminToggleCoupon(couponId, next);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${active ? "bg-primary" : "bg-muted-foreground/30"} ${isPending ? "opacity-50" : ""}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function CouponDeleteButton({ couponId }: { couponId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    startTransition(async () => {
      await adminDeleteCoupon(couponId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      title="Delete coupon"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
