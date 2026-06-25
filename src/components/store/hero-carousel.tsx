"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from "@/components/ui/carousel";

function CarouselDots() {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    setSelectedIndex(api.selectedScrollSnap());
    api.on("select", () => setSelectedIndex(api.selectedScrollSnap()));
  }, [api]);

  if (scrollSnaps.length <= 1) return null;

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => api?.scrollTo(index)}
          className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/30 hover:bg-primary/50"
            }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}


export function HeroCarousel({ banners }: { banners?: any[] }) {
  const [, setApi] = React.useState<CarouselApi>();

  const fallbackBanners = [
    {
      title: "Smart Shopping Trusted by Millions",
      subtitle: "Upto 35% OFF on your first order. Discover the best accessories.",
      link: "/products",
      imageUrl: "https://images.unsplash.com/photo-1583394838036-cbd9f0d576a4?q=80&w=2070&auto=format&fit=crop", // Placeholder image
      bgColor: "bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600",
    },
    {
      title: "Premium Audio Gear",
      subtitle: "Immerse yourself in crystal clear sound with our latest headphones.",
      link: "/categories/premium-audio",
      imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2000&auto=format&fit=crop",
      bgColor: "bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900",
    }
  ];

  const displayBanners = banners && banners.length > 0 ? banners : fallbackBanners;

  return (
    <section className="w-full px-4 lg:px-8 mb-12">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true, duration: 40 }}
        className="w-full max-w-7xl mx-auto rounded-[32px] overflow-hidden min-h-[400px] relative shadow-lg"
      >
        <CarouselContent className="ml-0">
          {displayBanners.map((slide, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full flex flex-col items-stretch min-h-[250px] md:min-h-[400px] relative">
              {/* If there's a link but no text, make the whole banner clickable */}
              {slide.link && !slide.title && !slide.subtitle && (
                <Link href={slide.link} className="absolute inset-0 z-20" aria-label={slide.title || "View promotion"} />
              )}

              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "Hero Banner"}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                />
              ) : (
                <div className={`absolute inset-0 ${slide.bgColor || 'bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600'}`} />
              )}

              {/* Optional Gradient Overlay for Text Readability - only if there's text */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              )}

              <div className="container mx-auto px-4 lg:px-8 max-w-7xl flex flex-col justify-center items-start relative z-10 w-full h-full min-h-[250px] md:min-h-[400px]">
                {(slide.title || slide.subtitle || (slide.link && (slide.title || slide.subtitle))) && (
                  <div className="w-full md:max-w-[55%] p-4 md:p-8 flex flex-col justify-center items-start">
                    {slide.title && (
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 tracking-tight text-white drop-shadow-md">
                        {slide.title}
                      </h1>
                    )}

                    {slide.subtitle && (
                      <p className="text-white/90 text-sm md:text-base max-w-[340px] mb-8 leading-relaxed font-medium drop-shadow">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.link && (
                      <Link
                        href={slide.link}
                        className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 py-3.5 font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
                      >
                        {slide.buttonText || "Shop Now"}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </section>
  );
}
