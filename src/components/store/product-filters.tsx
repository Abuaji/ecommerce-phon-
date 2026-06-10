"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Normally these would be fetched dynamically or passed as props
const CATEGORIES = ["Premium Audio", "Fast Chargers", "Protective Cases", "Power Banks"];
const BRANDS = ["Apple", "Samsung", "Anker", "Spigen", "Sony"];

export function ProductFilters() {
  return (
    <div className="space-y-8">
      {/* Categories Filter */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Categories</h4>
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-3">
              <Checkbox id={`category-${category}`} className="rounded-[4px]" />
              <Label htmlFor={`category-${category}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Brands Filter */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Brands</h4>
        <div className="space-y-3">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center space-x-3">
              <Checkbox id={`brand-${brand}`} className="rounded-[4px]" />
              <Label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-px bg-border w-full" />

      {/* Price Range Filter (Mock) */}
      <div>
        <h4 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Price Range</h4>
        <div className="space-y-3">
          {["Under ₹999", "₹1,000 - ₹2,999", "₹3,000 - ₹4,999", "Over ₹5,000"].map((range) => (
            <div key={range} className="flex items-center space-x-3">
              <Checkbox id={`price-${range}`} className="rounded-[4px]" />
              <Label htmlFor={`price-${range}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {range}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
