"use client";

import { useTransition } from "react";
import { adminUpdateOrderStatus } from "@/actions/admin/order.actions";
import { OrderStatus } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    startTransition(async () => {
      const result = await adminUpdateOrderStatus(orderId, value as OrderStatus);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <Select disabled={isPending} value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
        <SelectItem value="PROCESSING">Processing</SelectItem>
        <SelectItem value="SHIPPED">Shipped</SelectItem>
        <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
        <SelectItem value="DELIVERED">Delivered</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
        <SelectItem value="RETURNED">Returned</SelectItem>
      </SelectContent>
    </Select>
  );
}
