"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/hero-bg-premium.png",
    title: "Elevate Your Essentials.",
    subtitle: "Discover our curated collection of premium mobile accessories. Designed for durability, engineered for timeless style.",
    link: "/products"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2560&auto=format&fit=crop",
    title: "Seamless Power.",
    subtitle: "Experience next-generation wireless charging that blends seamlessly into your minimalist workspace.",
    link: "/categories/fast-chargers"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2560&auto=format&fit=crop",
    title: "Uncompromised Audio.",
    subtitle: "Immerse yourself in crystal clear sound with our premium selection of high-fidelity headphones.",
    link: "/categories/premium-audio"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1606220588913-b3aec4eb0c96?q=80&w=2560&auto=format&fit=crop",
    title: "Magnetic Perfection.",
    subtitle: "Snap on and go. Discover our range of MagSafe compatible accessories built for convenience.",
    link: "/products"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?q=80&w=2560&auto=format&fit=crop",
    title: "Sleek Protection.",
    subtitle: "Military-grade protection meets ultra-thin design. Safeguard your device without the bulk.",
    link: "/categories/protective-cases"
  }
];

function CarouselDots() {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!api) return;

    setScrollSnaps(api.scrollSnapList());
    setSelectedIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => api?.scrollTo(index)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === selectedIndex ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

export function HeroCarousel() {
  const [inView, setInView] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-[80vh] min-h-[550px] md:min-h-[700px] border-b border-border/20 overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="ml-0">
          {HERO_SLIDES.map((slide) => (
            <CarouselItem key={slide.id} className="relative w-full h-[80vh] min-h-[550px] md:min-h-[700px] pl-0 basis-full">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover object-center animate-[slow-zoom_10s_ease-out_forwards]"
                  priority={slide.id === 1}
                />
                {/* Elegant overlay to blend the image perfectly with the UI */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
                <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
              </div>

              {/* Floating Content Card */}
              <div className="absolute inset-0 flex items-center justify-center lg:justify-start px-4 lg:px-12 z-10">
                <div className={`relative w-full max-w-xl bg-white/90 backdrop-blur-xl border border-border/50 p-8 md:p-10 rounded-2xl shadow-xl text-left transition-all duration-700 ease-out transform ${inView ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-[0.98]'} overflow-hidden`}>
                  
                  {/* The Light Sweep Effect (Triggers when inView) */}
                  {inView && (
                    <div className="absolute inset-0 z-[-1] overflow-hidden rounded-2xl pointer-events-none">
                      <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[shimmer_1.5s_ease-out_forwards]" />
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/50 border border-zinc-200 backdrop-blur-md mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Antigravity</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-foreground mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-muted-foreground text-base md:text-lg font-sans mb-8 leading-relaxed max-w-lg">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-row items-center gap-4 flex-wrap">
                    {/* Primary CTA */}
                    <Button
                      size="lg"
                      className="h-12 px-8 bg-foreground text-background hover:opacity-90 text-xs font-semibold rounded-full shadow-md transition-all hover:scale-[1.02] tracking-widest uppercase shrink-0"
                      asChild
                    >
                      <Link href={slide.link}>Shop Now</Link>
                    </Button>

                    {/* Secondary Ghost CTA */}
                    <Link
                      href="/categories"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
                    >
                      Browse Categories
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </section>
  );
}
