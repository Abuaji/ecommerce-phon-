import { readClient } from "@/sanity/lib/client";
import { NEW_ARRIVALS_QUERY, TOP_SELLING_QUERY, ALL_CATEGORIES_QUERY, ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import Image from "next/image";
import { TopProductsCarousel } from "@/components/store/top-products-carousel";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { TrustBadges } from "@/components/store/trust-badges";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ChevronRight, Grid } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const [topSellingProducts, newArrivalProducts, allProducts, categories] = await Promise.all([
    readClient.fetch(TOP_SELLING_QUERY).catch(() => []),
    readClient.fetch(NEW_ARRIVALS_QUERY).catch(() => []),
    readClient.fetch(ALL_PRODUCTS_QUERY).catch(() => []),
    readClient.fetch(ALL_CATEGORIES_QUERY).catch(() => []),
  ]);

  // Fallbacks just in case the user hasn't tagged products in the CMS yet
  const displayTopSelling = topSellingProducts?.length > 0 ? topSellingProducts : allProducts?.slice(0, 8);
  const displayNewArrivals = newArrivalProducts?.length > 0 ? newArrivalProducts : allProducts?.slice(0, 8);
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Hero: Image Banner Layout */}
      <HeroCarousel />

      {/* Shop By Category: Circular Grid Layout */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-20 md:py-28 w-full border-b border-border/20">
          <div className="flex items-center justify-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Shop by Category</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 max-w-6xl mx-auto">
            {categories.slice(0, 6).map((category: any) => (
              <Link key={category._id} href={`/categories/${category.slug}`} className="group flex flex-col items-center text-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full bg-zinc-100 border border-border/30 transition-all duration-300 group-hover:border-zinc-300 group-hover:shadow-lg mb-4 flex items-center justify-center">
                  {category.imageUrl ? (
                    <Image 
                      src={category.imageUrl} 
                      alt={category.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100" 
                    />
                  ) : (
                    <Grid className="w-10 h-10 text-zinc-400 stroke-[1.5]" />
                  )}
                </div>
                <span className="font-sans text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Collection: Standard Layout */}
      <section className="py-20 md:py-28 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
          <div className="flex flex-row items-end justify-between mb-12 border-b border-border/20 pb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Top Selling Products</h2>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {(!displayTopSelling || displayTopSelling.length === 0) ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-muted/10 rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">No products found. Tag products as 'Trending' in the CMS.</p>
            </div>
          ) : (
            <div className="relative px-0 md:px-12 max-w-7xl mx-auto">
              <TopProductsCarousel products={displayTopSelling} />
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-10 md:py-16 w-full bg-zinc-50/50">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
          <div className="flex flex-row items-end justify-between mb-12 border-b border-border/20 pb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">New Arrivals</h2>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
              Shop latest <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {(!displayNewArrivals || displayNewArrivals.length === 0) ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-muted/10 rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">No new arrivals found. Tag products as 'New Arrival' in the CMS.</p>
            </div>
          ) : (
            <div className="relative px-0 md:px-12 max-w-7xl mx-auto">
              <TopProductsCarousel products={displayNewArrivals} />
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 lg:px-8 py-20 border-t border-border/20">
        <TrustBadges />
      </section>

      {/* Newsletter */}
      <section className="border-t border-border/20 bg-background py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
