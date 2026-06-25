"use client";

import { useState, useTransition } from "react";
import { adminUpdateOrderStatus } from "@/actions/admin/order.actions";
import { OrderStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const nextOptions = VALID_TRANSITIONS[status];

  const handleChange = (next: string) => {
    if (!next) return;
    const prev = status;
    startTransition(async () => {
      setStatus(next as OrderStatus);
      const result = await adminUpdateOrderStatus(orderId, next as OrderStatus);
      if (result?.error) {
        setStatus(prev); // revert on error
        alert(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
      {nextOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending} className="flex h-7 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 w-[130px] transition-colors">
            Move to &rarr;
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[130px]">
            {nextOptions.map((opt) => (
              <DropdownMenuItem 
                key={opt} 
                onClick={() => handleChange(opt)} 
                className="text-xs font-medium cursor-pointer"
              >
                {STATUS_LABELS[opt]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
