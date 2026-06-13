"use client";

import { useState, useTransition } from "react";
import { adminUpdateReturnStatus } from "@/actions/admin/return.actions";
import { ReturnStatus } from "@prisma/client";

const TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["ITEM_RECEIVED"],
  ITEM_RECEIVED: ["REFUND_PROCESSED", "REPLACEMENT_SENT"],
  REFUND_PROCESSED: ["CLOSED"],
  REPLACEMENT_SENT: ["CLOSED"],
  REJECTED: ["CLOSED"],
  CLOSED: [],
};

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: "Requested",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ITEM_RECEIVED: "Item Received",
  REFUND_PROCESSED: "Refund Processed",
  REPLACEMENT_SENT: "Replacement Sent",
  CLOSED: "Closed",
};

export function ReturnStatusUpdater({ returnId, currentStatus }: { returnId: string; currentStatus: ReturnStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const options = TRANSITIONS[status];

  if (options.length === 0) {
    return <span className="text-xs text-muted-foreground italic">{STATUS_LABELS[status]}</span>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ReturnStatus;
    startTransition(async () => {
      setStatus(next);
      await adminUpdateReturnStatus(returnId, next);
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm border rounded-md px-2 py-1 bg-background disabled:opacity-50"
    >
      <option value={status} disabled>{STATUS_LABELS[status]}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>
      ))}
    </select>
  );
}
