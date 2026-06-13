"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted/30 border border-border/20 flex flex-col gap-4 items-center justify-center text-muted-foreground/50">
        <Package className="w-16 h-16 stroke-[1]" />
        <span className="font-mono text-xs uppercase tracking-widest">Awaiting Image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide shrink-0 lg:w-24">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative aspect-square w-20 lg:w-full overflow-hidden shrink-0 rounded-xl border-2 transition-all duration-300",
                selectedImage === idx ? "border-primary bg-primary/5" : "border-transparent bg-muted/30 hover:bg-muted/50"
              )}
            >
              <Image 
                src={image} 
                alt={`${alt} thumbnail ${idx + 1}`} 
                fill 
                className="object-contain p-2"
                sizes="(max-width: 768px) 80px, 96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square w-full bg-muted/30 border border-border/20 rounded-2xl overflow-hidden flex items-center justify-center p-8">
        <Image 
          src={images[selectedImage]!} 
          alt={alt} 
          fill 
          priority
          className="object-contain p-8 transition-transform duration-700 ease-out hover:scale-110 drop-shadow-2xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
      </div>
    </div>
  );
}
