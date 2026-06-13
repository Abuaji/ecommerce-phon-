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
      <div className="border-b border-border/20 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Brands</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-foreground">Shop by Brand</h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-sans">Discover accessories from your favorite brands.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {(!brands || brands.length === 0) ? (
          <div className="text-center py-32 border border-dashed border-border/40 rounded-3xl">
            <h3 className="text-sm uppercase tracking-widest font-mono mb-2 text-foreground">No brands found</h3>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand: any) => (
              <Link key={brand._id} href={`/brands/${brand.slug}`} className="group block h-full">
                <article className="card-elegant relative h-[250px] overflow-hidden rounded-xl p-8 flex flex-col justify-end text-center">
                  <div className="absolute inset-0 z-0 flex items-center justify-center p-12">
                    {brand.imageUrl ? (
                      <Image 
                        src={brand.imageUrl} 
                        alt={brand.name} 
                        fill 
                        className="object-contain p-12 group-hover:scale-110 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-100 drop-shadow-2xl" 
                      />
                    ) : (
                      <div className="font-mono text-xs uppercase tracking-widest text-slate-700 group-hover:text-slate-500 transition-colors">Awaiting Logo</div>
                    )}
                  </div>
                  <div className="relative z-10 mt-auto">
                    <span className="font-sans text-xl font-semibold tracking-tight text-foreground bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/20 shadow-xl">{brand.name}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
