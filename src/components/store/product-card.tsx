"use client";

import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Package } from "lucide-react";
import { PriceDisplay } from "@/components/store/price-display";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: { current: string } | string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    category?: string;
    brand?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const slug = typeof product.slug === 'string' ? product.slug : product.slug?.current || '';
  
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white p-2.5 md:p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden flex items-center justify-center p-2 md:p-4 bg-[#F6F7FA] rounded-xl mb-3 md:mb-4">
        {product.imageUrl ? (
          <Link href={`/products/${slug}`} className="block w-full h-full relative z-10">
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md mix-blend-multiply"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <Link href={`/products/${slug}`} className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 z-10 gap-3 group-hover:text-muted-foreground transition-colors">
            <Package className="w-12 h-12 stroke-[1]" />
          </Link>
        )}
        
        {/* Badges */}
        {product.discountPrice && (
          <div className="absolute top-2 left-2 z-20 bg-destructive text-white font-bold text-[10px] uppercase px-2 py-1 rounded-full shadow-sm">
            SALE
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute bottom-2 left-2 right-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
          <AddToCartButton 
            product={{
              _id: product._id,
              name: product.name,
              price: product.price,
              discountPrice: product.discountPrice,
              imageUrl: product.imageUrl
            }} 
            variant="default"
            size="sm"
            className="w-full h-10 rounded-md bg-primary/95 backdrop-blur-sm text-white hover:bg-primary font-bold text-[11px] uppercase transition-all duration-300 shadow-md"
          />
        </div>
      </div>
      
      {/* Product Details - eTrade Style */}
      <div className="flex flex-col flex-1 relative z-20 items-start text-left px-1 md:px-2 pb-1 md:pb-2">
        
        <Link href={`/products/${slug}`} className="mb-1 w-full">
          <h3 className="font-bold text-xs md:text-sm text-gray-800 tracking-tight leading-snug hover:text-primary transition-colors line-clamp-2 md:line-clamp-1 w-full">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="text-[9px] md:text-[11px] font-medium text-gray-500 mb-1.5 md:mb-2 line-clamp-1">
            {product.brand}
          </p>
        )}
        
        <div className="mt-auto flex flex-wrap items-center justify-start gap-1.5 md:gap-2 pt-1 md:pt-2">
          {product.discountPrice ? (
            <>
              <PriceDisplay priceInCents={product.discountPrice} size="sm" className="md:hidden" />
              <PriceDisplay priceInCents={product.discountPrice} size="md" className="hidden md:inline-flex" />
              <span className="text-[10px] md:text-[11px] line-through text-gray-400">{((product.price) / 100).toFixed(2)}$</span>
            </>
          ) : (
            <>
              <PriceDisplay priceInCents={product.price} size="sm" className="md:hidden" />
              <PriceDisplay priceInCents={product.price} size="md" className="hidden md:inline-flex" />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
