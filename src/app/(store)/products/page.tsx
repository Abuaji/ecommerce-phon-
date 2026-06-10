import { readClient } from "@/sanity/lib/client";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { ProductSort } from "@/components/store/product-sort";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata = {
  title: "All Products | Mobile Accessories",
  description: "Browse our entire catalog of premium mobile accessories.",
};

export default async function ProductsPage() {
  const products = await readClient.fetch(ALL_PRODUCTS_QUERY).catch(() => []);

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-border/40 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">All Products</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Premium Accessories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Discover our curated collection of high-end accessories designed to complement your lifestyle.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border/50">
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
            Showing <span className="text-foreground">{products.length}</span> products
          </p>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <ProductSort />
          </div>
        </div>

        {/* Grid */}
        {(!products || products.length === 0) ? (
          <div className="text-center py-32 bg-white border border-border/40">
            <h3 className="text-sm uppercase tracking-widest font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination UI (Mock) */}
        {products.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-20 pt-8 border-t border-border/50">
            <Button variant="outline" disabled className="rounded-none border-border/40 text-[11px] tracking-widest uppercase font-bold h-12 px-6">Previous</Button>
            <Button variant="default" className="w-12 h-12 rounded-none bg-foreground text-background text-[11px] tracking-widest uppercase font-bold">1</Button>
            <Button variant="outline" className="w-12 h-12 rounded-none border-border/40 text-[11px] tracking-widest uppercase font-bold text-muted-foreground">2</Button>
            <Button variant="outline" className="w-12 h-12 rounded-none border-border/40 text-[11px] tracking-widest uppercase font-bold text-muted-foreground">3</Button>
            <Button variant="outline" className="rounded-none border-border/40 text-[11px] tracking-widest uppercase font-bold h-12 px-6">Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
