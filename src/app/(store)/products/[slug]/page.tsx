import { readClient } from "@/sanity/lib/client";
import { PRODUCT_BY_SLUG_QUERY, RELATED_PRODUCTS_QUERY } from "@/sanity/queries";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { TrustBadges } from "@/components/store/trust-badges";
import { TopProductsCarousel } from "@/components/store/top-products-carousel";
import { RecentlyViewed } from "@/components/store/recently-viewed";
import { PriceDisplay } from "@/components/store/price-display";
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

  // Fetch related products
  const relatedProducts = product.category ? await readClient.fetch(RELATED_PRODUCTS_QUERY, { 
    categoryName: product.category,
    currentProductId: product._id
  }).catch(() => []) : [];

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
      <div className="border-b border-border/20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors shrink-0">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/categories`} className="hover:text-foreground transition-colors shrink-0">{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate shrink-0">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-6 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-5 xl:col-span-5 shrink-0 sticky top-28">
            <ProductGallery images={images} alt={product.name} />
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col pt-0 lg:pt-4">
            
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center text-[#F59E0B]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                </span>
                <span className="text-xs font-semibold text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-gray-900 leading-[1.1]">
              {product.name}
            </h1>
            
            {product.brand && (
              <p className="text-sm font-medium text-gray-500 mb-6">
                Brand: <span className="text-gray-900">{product.brand}</span>
              </p>
            )}
            
            <div className="mb-8 pb-6 border-b border-gray-100 flex items-center gap-4">
              {product.discountPrice && product.discountPrice > product.price ? (
                <>
                  <PriceDisplay priceInCents={product.price} size="xl" />
                  <span className="text-xl line-through text-gray-400">{(product.discountPrice / 100).toFixed(2)}$</span>
                </>
              ) : (
                <PriceDisplay priceInCents={product.price} size="xl" />
              )}
            </div>

            <div className="mb-10">
              <AddToCartButton 
                product={{
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  imageUrl: images[0]
                }} 
                className="w-full md:w-3/4 h-14 text-[13px] tracking-wide uppercase font-bold rounded-full bg-primary text-white hover:bg-primary/90 transition-all border-none shadow-md"
                size="lg"
              />
            </div>

            {(product.shortDescription || product.description?.[0]?.children?.[0]?.text) && (
              <div className="mb-10 text-sm leading-relaxed text-gray-600">
                <p>{product.shortDescription || product.description?.[0]?.children?.[0]?.text}</p>
              </div>
            )}

            <Accordion className="w-full mb-10 border-t border-gray-100">
              {product.description?.[0]?.children?.[0]?.text && (
                <AccordionItem value="features" className="border-b border-gray-100">
                  <AccordionTrigger className="text-[13px] uppercase tracking-widest font-bold hover:no-underline py-6">Features & Details</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-gray-500 pb-6">
                     <p>{product.description[0].children[0].text}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {product.specifications && product.specifications.length > 0 && (
                <AccordionItem value="specs" className="border-b border-gray-100">
                  <AccordionTrigger className="text-[13px] uppercase tracking-widest font-bold hover:no-underline py-6">Technical Specifications</AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <ul className="space-y-4">
                      {product.specifications.map((spec: any, i: number) => (
                        <li key={i} className="flex grid grid-cols-3 gap-4 border-b border-gray-100 pb-4 text-[13px]">
                          <span className="font-semibold text-gray-900">{spec.key}</span>
                          <span className="col-span-2 text-gray-500">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.compatibility && product.compatibility.length > 0 && (
                <AccordionItem value="compatibility" className="border-b border-gray-100">
                  <AccordionTrigger className="text-[13px] uppercase tracking-widest font-bold hover:no-underline py-6">Compatibility</AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <ul className="list-disc pl-5 space-y-2 text-[13px] text-gray-500">
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

        {/* Similar Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-border/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                Similar Products
              </h2>
            </div>
            <TopProductsCarousel products={relatedProducts} />
          </div>
        )}

        {/* Recently Viewed Section */}
        <RecentlyViewed currentProduct={product} />

      </div>
      
      {/* Trust Badges - Full Width section */}
      <div className="mt-24 border-y border-border/20 bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}
