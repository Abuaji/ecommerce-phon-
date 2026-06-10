import { readClient } from "@/sanity/lib/client";
import { FEATURED_PRODUCTS_QUERY, BANNERS_QUERY, ALL_CATEGORIES_QUERY } from "@/sanity/queries";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { TrustBadges } from "@/components/store/trust-badges";
import { NewsletterForm } from "@/components/store/newsletter-form";

export const revalidate = 3600;

export default async function HomePage() {
  const [featuredProducts, banners, categories] = await Promise.all([
    readClient.fetch(FEATURED_PRODUCTS_QUERY).catch(() => []),
    readClient.fetch(BANNERS_QUERY).catch(() => []),
    readClient.fetch(ALL_CATEGORIES_QUERY).catch(() => []),
  ]);

  const heroBanner = banners?.[0];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[600px] flex items-center bg-white border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-12 h-full items-center">
          <div className="flex flex-col justify-center max-w-xl z-10 pt-20 md:pt-0">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
              {heroBanner?.title || "Elevate Your Essentials"}
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">
              Discover our curated collection of premium mobile accessories. Designed for durability and timeless style.
            </p>
            <div>
              <Button size="lg" className="h-14 px-12 text-[11px] tracking-[0.2em] uppercase font-bold rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all border-none" asChild>
                <Link href={heroBanner?.link || "/products"}>Explore Collection</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-full w-full hidden md:block">
            {heroBanner?.imageUrl && (
              <Image 
                src={heroBanner.imageUrl} 
                alt={heroBanner.title || "Hero Image"} 
                fill 
                className="object-cover object-center"
                priority
              />
            )}
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-24 w-full">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-2">Categories</h2>
              <p className="text-muted-foreground">Shop by product type</p>
            </div>
            <Link href="/categories" className="text-[11px] font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-muted-foreground transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.slice(0, 4).map((category: any) => (
              <Link key={category._id} href={`/categories/${category.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden bg-white border border-border/40 p-8 mb-4 transition-colors group-hover:border-border">
                  {category.imageUrl ? (
                    <Image src={category.imageUrl} alt={category.name} fill className="object-contain p-8 group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : null}
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-center block">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section className="bg-white border-y border-border/50 py-24 w-full">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-2">Featured</h2>
              <p className="text-muted-foreground">Our most popular essentials</p>
            </div>
            <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-muted-foreground transition-colors">
              Shop All
            </Link>
          </div>
          
          {(!featuredProducts || featuredProducts.length === 0) ? (
            <p className="text-muted-foreground text-center py-20">Products coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <TrustBadges />
      </section>

      {/* Newsletter */}
      <section className="bg-white border-t border-border/50 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
