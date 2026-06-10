"use client";

import { useState, useTransition } from "react";
import { adminAdjustStock } from "@/actions/admin/inventory.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InventoryAdjuster({ inventoryId }: { inventoryId: string }) {
  const [isPending, startTransition] = useTransition();
  const [change, setChange] = useState("");

  const handleAdjust = () => {
    const val = parseInt(change);
    if (isNaN(val) || val === 0) return alert("Enter a valid non-zero number");

    startTransition(async () => {
      const result = await adminAdjustStock(inventoryId, val, "Manual Dashboard Adjustment");
      if (result?.error) {
        alert(result.error);
      } else {
        setChange("");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={change}
        onChange={(e) => setChange(e.target.value)}
        placeholder="+/-"
        className="w-20"
        disabled={isPending}
      />
      <Button size="sm" onClick={handleAdjust} disabled={isPending || !change}>
        {isPending ? "..." : "Adjust"}
      </Button>
    </div>
  );
}
