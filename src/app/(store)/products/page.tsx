import { readClient } from "@/sanity/lib/client";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { ProductSort } from "@/components/store/product-sort";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "All Products | Mobile Accessories",
  description: "Browse our entire catalog of premium mobile accessories.",
};

const PRODUCTS_PER_PAGE = 8;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));

  const allProducts = await readClient.fetch(ALL_PRODUCTS_QUERY).catch(() => []);
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);

  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const products = allProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  // Build page numbers to show (max 5 around current)
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="border-b border-border/20 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">All Products</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-foreground">Premium Accessories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-sans">Discover our curated collection of high-end accessories designed to complement your lifestyle.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border/20">
          <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
            Showing <span className="text-foreground">{startIndex + 1}–{Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts)}</span> of <span className="text-foreground">{totalProducts}</span> products
          </p>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <ProductSort />
          </div>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border/40 rounded-3xl">
            <h3 className="text-sm uppercase tracking-widest font-mono mb-2 text-foreground">No products found</h3>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Real Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-20 pt-8 border-t border-border/20">
            {/* Previous */}
            {safePage > 1 ? (
              <Link
                href={`/products?page=${safePage - 1}`}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border/60 text-[11px] tracking-widest uppercase font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border/30 text-[11px] tracking-widest uppercase font-semibold text-muted-foreground/40 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </span>
            )}

            {/* Page Numbers */}
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground text-sm">…</span>
              ) : (
                <Link
                  key={p}
                  href={`/products?page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-[11px] font-semibold tracking-widest transition-colors ${
                    safePage === p
                      ? "bg-foreground text-background"
                      : "border border-border/60 text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {p}
                </Link>
              )
            )}

            {/* Next */}
            {safePage < totalPages ? (
              <Link
                href={`/products?page=${safePage + 1}`}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border/60 text-[11px] tracking-widest uppercase font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border/30 text-[11px] tracking-widest uppercase font-semibold text-muted-foreground/40 cursor-not-allowed">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
