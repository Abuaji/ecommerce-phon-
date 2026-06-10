import { readClient } from "@/sanity/lib/client";
import { ALL_BRANDS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

export const metadata = {
  title: "Brands | Mobile Accessories",
  description: "Browse our products by brand.",
};

export default async function BrandsPage() {
  const brands = await readClient.fetch(ALL_BRANDS_QUERY).catch(() => []);

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-border/40 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Brands</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Shop by Brand</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Discover accessories from your favorite brands.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {(!brands || brands.length === 0) ? (
          <div className="text-center py-32 bg-white border border-border/40">
            <h3 className="text-sm uppercase tracking-widest font-bold mb-2">No brands found</h3>
            <p className="text-muted-foreground text-sm">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
            {brands.map((brand: any) => (
              <Link key={brand._id} href={`/brands/${brand.slug}`} className="group block">
                <div className="relative aspect-video overflow-hidden bg-white border border-border/40 p-8 mb-4 transition-colors group-hover:border-border flex items-center justify-center">
                  {brand.imageUrl ? (
                    <Image 
                      src={brand.imageUrl} 
                      alt={brand.name} 
                      fill 
                      className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply" 
                    />
                  ) : (
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">No Logo</div>
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-center block">{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
