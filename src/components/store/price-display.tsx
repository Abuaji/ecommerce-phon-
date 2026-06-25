// import React from "react";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  priceInCents: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceDisplay({ priceInCents, className, size = "md" }: PriceDisplayProps) {
  // Convert cents to string like "14.29"
  const formatted = (priceInCents / 100).toFixed(2);
  const [whole, decimal] = formatted.split(".");

  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const supSizeClasses = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-[14px]",
    xl: "text-[16px]",
  };

  return (
    <div className={cn("font-bold text-primary font-sans flex items-baseline tracking-tight", sizeClasses[size], className)}>
      <span className="text-[0.8em] mr-0.5">₹</span>{whole}.
      <sup className={cn("font-bold", supSizeClasses[size])}>
        {decimal}
      </sup>
    </div>
  );
}
