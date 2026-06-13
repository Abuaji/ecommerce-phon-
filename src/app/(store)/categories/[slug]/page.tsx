import { readClient } from "@/sanity/lib/client";
import { PRODUCTS_BY_CATEGORY_QUERY, CATEGORY_BY_SLUG_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { ProductSort } from "@/components/store/product-sort";
import { notFound } from "next/navigation";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = await readClient.fetch(CATEGORY_BY_SLUG_QUERY, { slug: resolvedParams.slug }).catch(() => null);
  
  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.seoTitle || `${category.name} | Mobile Accessories`,
    description: category.seoDescription || category.description || `Browse our selection of ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = await readClient.fetch(CATEGORY_BY_SLUG_QUERY, { slug: resolvedParams.slug }).catch(() => null);

  if (!category) {
    notFound();
  }

  const products = await readClient.fetch(PRODUCTS_BY_CATEGORY_QUERY, { slug: resolvedParams.slug }).catch(() => []);

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="border-b border-border/20 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-foreground">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-2xl font-sans">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border/20">
          <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
            Showing <span className="text-foreground">{products.length}</span> products
          </p>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <ProductSort />
          </div>
        </div>

        {/* Grid */}
        {(!products || products.length === 0) ? (
          <div className="text-center py-32 border border-dashed border-border/40 rounded-3xl">
            <h3 className="text-sm uppercase tracking-widest font-mono mb-2 text-foreground">No products found</h3>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">There are no products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
