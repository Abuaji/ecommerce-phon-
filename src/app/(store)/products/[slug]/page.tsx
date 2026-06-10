import { readClient } from "@/sanity/lib/client";
import { PRODUCT_BY_SLUG_QUERY } from "@/sanity/queries";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { TrustBadges } from "@/components/store/trust-badges";
import { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

// Next.js dynamic metadata generation for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await readClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug }).catch(() => null);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || `${product.name} | Mobile Accessories`,
    description: product.seoDescription || product.description?.[0]?.children?.[0]?.text || "Premium mobile accessories.",
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await readClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug }).catch(() => null);

  if (!product) {
    notFound();
  }

  // Generate JSON-LD Schema for rich Google search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0],
    description: product.seoDescription,
    brand: {
      "@type": "Brand",
      name: product.brand || "Unknown Brand",
    },
    offers: {
      "@type": "Offer",
      url: `https://your-domain.com/products/${slug}`,
      priceCurrency: "INR",
      price: (product.discountPrice || product.price) / 100,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  const images = product.images || (product.mainImage ? [product.mainImage] : []);

  return (
    <div className="w-full min-h-screen pb-24 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/categories`} className="hover:text-foreground transition-colors">{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-8 lg:pt-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-1/2 shrink-0 sticky top-28 bg-white p-4 border border-border/40">
            <ProductGallery images={images} alt={product.name} />
          </div>

          {/* Right Column: Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            {product.brand && (
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">{product.brand}</span>
            )}
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="mb-10 pb-8 border-b border-border/50">
              {product.discountPrice ? (
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-semibold tracking-tight">₹{(product.discountPrice / 100).toLocaleString()}</span>
                  <span className="text-lg line-through text-muted-foreground">₹{(product.price / 100).toLocaleString()}</span>
                  <span className="bg-foreground text-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Sale</span>
                </div>
              ) : (
                <span className="text-3xl font-semibold tracking-tight">₹{(product.price / 100).toLocaleString()}</span>
              )}
              <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-widest font-semibold">Inclusive of all taxes</p>
            </div>

            <div className="mb-12">
              <AddToCartButton 
                product={{
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  imageUrl: images[0]
                }} 
                className="w-full h-16 text-[11px] tracking-[0.2em] uppercase font-bold rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all border-none"
                size="lg"
              />
            </div>

            <div className="mb-12 text-sm leading-relaxed text-muted-foreground">
              <p>{product.shortDescription || product.description?.[0]?.children?.[0]?.text || "Premium mobile accessory built to last. Impeccable design meets ultimate durability."}</p>
            </div>

            <Accordion type="single" collapsible className="w-full mb-10 border-t border-border/50">
              <AccordionItem value="features" className="border-b border-border/50">
                <AccordionTrigger className="text-[12px] uppercase tracking-widest font-bold hover:no-underline py-6">Features & Details</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-6">
                   <p>{product.description?.[0]?.children?.[0]?.text || "Detailed features coming soon."}</p>
                </AccordionContent>
              </AccordionItem>
              
              {product.specifications && product.specifications.length > 0 && (
                <AccordionItem value="specs" className="border-b border-border/50">
                  <AccordionTrigger className="text-[12px] uppercase tracking-widest font-bold hover:no-underline py-6">Technical Specifications</AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <ul className="space-y-4">
                      {product.specifications.map((spec: any, i: number) => (
                        <li key={i} className="flex grid grid-cols-3 gap-4 border-b border-border/20 pb-4 text-[13px]">
                          <span className="font-semibold text-foreground">{spec.key}</span>
                          <span className="col-span-2 text-muted-foreground">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.compatibility && product.compatibility.length > 0 && (
                <AccordionItem value="compatibility" className="border-b border-border/50">
                  <AccordionTrigger className="text-[12px] uppercase tracking-widest font-bold hover:no-underline py-6">Compatibility</AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <ul className="list-disc pl-5 space-y-2 text-[13px] text-muted-foreground">
                      {product.compatibility.map((device: any, i: number) => (
                        <li key={i}>{device}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            
          </div>
        </div>
      </div>
      
      {/* Trust Badges - Full Width section */}
      <div className="mt-24 border-y border-border/50 bg-white py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}
