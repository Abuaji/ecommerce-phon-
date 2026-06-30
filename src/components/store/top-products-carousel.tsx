"use client";

// import * as React from "react";
import { ProductCard } from "@/components/store/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TopProductsCarouselProps {
  products: any[];
}

export function TopProductsCarousel({ products }: TopProductsCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3 sm:-ml-4">
        {products.map((product) => (
          <CarouselItem key={product._id} className="pl-3 sm:pl-4 basis-[45%] sm:basis-[45%] md:basis-1/3 lg:basis-1/4 xl:basis-1/4">
            <div className="h-full">
              <ProductCard product={product} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="hidden md:block">
        <CarouselPrevious className="-left-12 border-border/40 hover:bg-foreground hover:text-background transition-colors" />
        <CarouselNext className="-right-12 border-border/40 hover:bg-foreground hover:text-background transition-colors" />
      </div>
    </Carousel>
  );
}
