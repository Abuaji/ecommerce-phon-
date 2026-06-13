import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: { current: string } | string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    category?: string;
    brand?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const slug = typeof product.slug === 'string' ? product.slug : product.slug?.current || '';
  
  return (
    <article className="card-elegant flex flex-col group relative overflow-hidden rounded-xl">
      {/* Image Container */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden flex items-center justify-center p-6">
        {product.imageUrl ? (
          <Link href={`/products/${slug}`} className="block w-full h-full relative z-10">
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-contain w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <Link href={`/products/${slug}`} className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 z-10 gap-3 group-hover:text-muted-foreground transition-colors">
            <Package className="w-12 h-12 stroke-[1]" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Awaiting Image</span>
          </Link>
        )}
        
        {/* Badges */}
        {product.discountPrice && (
          <div className="absolute top-3 left-3 z-20 bg-foreground text-background font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm">
            SALE
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
          <AddToCartButton 
            product={{
              _id: product._id,
              name: product.name,
              price: product.price,
              discountPrice: product.discountPrice,
              imageUrl: product.imageUrl
            }} 
            variant="default"
            size="sm"
            className="w-full h-10 rounded-xl bg-foreground/95 backdrop-blur-sm text-background hover:bg-foreground font-mono tracking-widest text-[10px] uppercase transition-all duration-300 shadow-xl"
          />
        </div>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col flex-1 relative z-20 bg-white p-4 pt-3.5">
        <div className="mb-3 flex-1">
          {product.brand && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">{product.brand}</p>
          )}
          <Link href={`/products/${slug}`}>
            <h3 className="font-semibold line-clamp-2 text-sm text-foreground tracking-tight leading-snug hover:opacity-70 transition-opacity" style={{letterSpacing: '-0.01em'}}>{product.name}</h3>
          </Link>
        </div>
        
        <div className="mt-auto flex items-center gap-3 pt-3 border-t border-border/30">
          {product.discountPrice ? (
            <>
              <span className="font-mono text-sm text-foreground tracking-tight font-semibold">₹{(product.discountPrice / 100).toLocaleString()}</span>
              <span className="font-mono text-[10px] line-through text-muted-foreground">₹{(product.price / 100).toLocaleString()}</span>
            </>
          ) : (
            <span className="font-mono text-sm text-foreground tracking-tight font-semibold">₹{(product.price / 100).toLocaleString()}</span>
          )}
        </div>
      </div>
    </article>
  );
}
