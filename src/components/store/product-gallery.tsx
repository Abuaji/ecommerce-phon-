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
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Main Image */}
      <div className="relative aspect-[4/5] lg:aspect-square w-full bg-[#F4F7F6]/80 rounded-[2rem] lg:rounded-[32px] overflow-hidden flex items-center justify-center p-8 border border-black/5">
        <Image 
          src={images[selectedImage]!} 
          alt={alt} 
          fill 
          priority
          className="object-contain p-8 transition-transform duration-700 ease-out hover:scale-105 drop-shadow-md mix-blend-multiply"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative aspect-square w-20 shrink-0 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                selectedImage === idx ? "border-primary bg-[#F4F7F6] scale-95" : "border-transparent bg-[#F4F7F6]/50 hover:bg-[#F4F7F6]"
              )}
            >
              <Image 
                src={image} 
                alt={`${alt} thumbnail ${idx + 1}`} 
                fill 
                className="object-contain p-2 mix-blend-multiply"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
