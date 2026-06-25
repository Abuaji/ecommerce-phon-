import { readClient } from "@/sanity/lib/client";
import { NEW_ARRIVALS_QUERY, TOP_SELLING_QUERY, ALL_CATEGORIES_QUERY, ALL_PRODUCTS_QUERY, HOMEPAGE_QUERY, TRUST_BADGES_QUERY } from "@/sanity/queries";
import Link from "next/link";
import Image from "next/image";
import { TopProductsCarousel } from "@/components/store/top-products-carousel";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { TrustBadges } from "@/components/store/trust-badges";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ChevronRight, Grid } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const [topSellingProducts, newArrivalProducts, allProducts, categories, homepage, allBanners, trustBadges] = await Promise.all([
    readClient.fetch(TOP_SELLING_QUERY).catch(() => []),
    readClient.fetch(NEW_ARRIVALS_QUERY).catch(() => []),
    readClient.fetch(ALL_PRODUCTS_QUERY).catch(() => []),
    readClient.fetch(ALL_CATEGORIES_QUERY).catch(() => []),
    readClient.fetch(HOMEPAGE_QUERY).catch(() => null),
    readClient.fetch(`*[_type == "banner" && isActive == true] | order(displayOrder asc) {
      _id,
      "title": heading,
      "subtitle": subheading,
      "imageUrl": desktopImage.asset->url,
      "mobileImageUrl": mobileImage.asset->url,
      "link": primaryButtonUrl,
      "buttonText": primaryButtonText
    }`).catch(() => []),
    readClient.fetch(TRUST_BADGES_QUERY).catch(() => []),
  ]);

  // Extract hero banners from homepage data, fallback to all active banners
  const heroSection = homepage?.activeSections?.find((s: any) => s.sectionType === 'hero');
  const banners = (heroSection?.banners?.length > 0) ? heroSection.banners : allBanners;

  // Fallbacks just in case the user hasn't tagged products in the CMS yet
  const displayTopSelling = topSellingProducts?.length > 0 ? topSellingProducts : allProducts?.slice(0, 8);
  const displayNewArrivals = newArrivalProducts?.length > 0 ? newArrivalProducts : allProducts?.slice(0, 8);
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Hero: Image Banner Layout */}
      <HeroCarousel banners={banners} />

      {/* Category Filter Pills */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-6 w-full max-w-7xl">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* "All" or "Recommended" default pill */}
            <Link 
              href="/products" 
              className="flex-none px-6 py-2.5 rounded-full text-sm font-semibold transition-colors bg-primary text-primary-foreground shadow-md"
            >
              All Categories
            </Link>
            
            {categories.map((category: any) => (
              <Link 
                key={category._id} 
                href={`/categories/${category.slug}`} 
                className="flex-none px-6 py-2.5 rounded-full text-sm font-semibold transition-colors bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100"
              >
                {category.name}
              </Link>
            ))}
            
            <button className="flex-none px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 ml-auto flex items-center gap-2">
              Sort by
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
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
        <TrustBadges badges={trustBadges} />
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
