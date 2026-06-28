"use client";

import * as React from "react";
import { TopProductsCarousel } from "@/components/store/top-products-carousel";

const RECENTLY_VIEWED_KEY = "lumina_recently_viewed";

interface RecentlyViewedProps {
  currentProduct: any;
}

export function RecentlyViewed({ currentProduct }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!currentProduct || !currentProduct._id) return;

    try {
      // 1. Read existing products
      const existingRaw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];

      // 2. Filter out the current product for display
      const filteredForDisplay = existing.filter((p: any) => p._id !== currentProduct._id);
      setRecentProducts(filteredForDisplay);

      // 3. Prepare the new list to save (current product at the front)
      // Only keep the essential fields to save storage space
      const lightweightProduct = {
        _id: currentProduct._id,
        name: currentProduct.name,
        slug: currentProduct.slug,
        imageUrl: currentProduct.mainImage || currentProduct.imageUrl || (currentProduct.images && currentProduct.images[0]),
        price: currentProduct.price,
        discountPrice: currentProduct.discountPrice,
        category: currentProduct.category,
        brand: currentProduct.brand
      };

      const newList = [lightweightProduct, ...existing.filter((p: any) => p._id !== currentProduct._id)].slice(0, 10);
      
      // 4. Save back to localStorage
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to manage recently viewed products", error);
    }
  }, [currentProduct]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-16 border-t border-border/20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Recently Viewed
        </h2>
      </div>
      <TopProductsCarousel products={recentProducts} />
    </div>
  );
}
