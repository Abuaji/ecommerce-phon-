"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center text-muted-foreground">
        No Image Available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide shrink-0 lg:w-24">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative aspect-square w-20 lg:w-full overflow-hidden shrink-0 border transition-all duration-200",
                selectedImage === idx ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image 
                src={image} 
                alt={`${alt} thumbnail ${idx + 1}`} 
                fill 
                className="object-cover bg-[#F5F5F5] mix-blend-multiply"
                sizes="(max-width: 768px) 80px, 96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square w-full bg-[#F5F5F5] overflow-hidden">
        <Image 
          src={images[selectedImage]!} 
          alt={alt} 
          fill 
          priority
          className="object-cover mix-blend-multiply transition-transform duration-700 ease-out hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
      </div>
    </div>
  );
}
