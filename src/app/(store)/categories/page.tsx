import { readClient } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries";
import Link from "next/link";
import Image from "next/image";
import { Grid } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "Categories | Mobile Accessories",
  description: "Browse our premium mobile accessories by category.",
};

export default async function CategoriesPage() {
  const categories = await readClient.fetch(ALL_CATEGORIES_QUERY).catch(() => []);

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="border-b border-border/20 pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Categories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-foreground">Hardware Ecosystem</h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-sans">Precision-milled components for every facet of your digital life.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-12">
        {(!categories || categories.length === 0) ? (
          <div className="text-center py-32 border border-dashed border-border/40 rounded-3xl">
            <Grid className="w-12 h-12 text-slate-700 mb-4 mx-auto" />
            <h3 className="text-sm uppercase tracking-widest font-mono mb-2 text-foreground">No Categories Found</h3>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category: any) => (
              <Link key={category._id} href={`/categories/${category.slug}`} className="group block h-full">
                <article className="card-elegant relative h-[300px] overflow-hidden rounded-xl p-8 flex flex-col justify-end">
                  <div className="absolute inset-0 z-0 flex items-center justify-center p-12">
                    {category.imageUrl ? (
                      <Image 
                        src={category.imageUrl} 
                        alt={category.name} 
                        fill 
                        className="object-contain p-12 group-hover:scale-110 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-100 drop-shadow-2xl" 
                      />
                    ) : (
                      <Grid className="w-20 h-20 text-slate-800 stroke-[1] group-hover:text-slate-600 transition-colors duration-500" />
                    )}
                  </div>
                  <div className="relative z-10">
                    <span className="font-sans text-xl font-semibold tracking-tight text-foreground">{category.name}</span>
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
