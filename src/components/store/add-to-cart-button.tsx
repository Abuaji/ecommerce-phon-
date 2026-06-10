"use client";

import { useCartStore } from "@/stores/cart.store";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useState } from "react";

interface AddToCartProps extends Omit<ButtonProps, 'onClick'> {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number | undefined;
    imageUrl?: string | undefined;
  };
}

export function AddToCartButton({ product, className, variant, size = "lg", ...props }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    const finalPrice = product.discountPrice || product.price;
    addItem({
      sanityProductId: product._id,
      name: product.name,
      price: finalPrice,
      imageUrl: product.imageUrl || undefined,
      quantity: 1,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button 
      size={size} 
      className={className || "w-full md:w-auto rounded-none bg-foreground text-background hover:bg-foreground/90 text-[11px] tracking-[0.2em] uppercase font-bold"}
      onClick={handleAdd}
      variant={added ? "secondary" : variant || "default"}
      {...props}
    >
      {added ? "Added To Cart" : "Add to Cart"}
    </Button>
  );
}
