import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

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
    <div className="flex flex-col group relative bg-white border border-border/40 p-4 transition-all duration-300 hover:border-border">
      <div className="relative aspect-[4/5] overflow-hidden mb-5 bg-white">
        {product.imageUrl ? (
          <Link href={`/products/${slug}`} className="block w-full h-full relative">
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <Link href={`/products/${slug}`} className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20">
            <span className="text-xs uppercase tracking-widest">No Image</span>
          </Link>
        )}
        
        {/* Badges */}
        {product.discountPrice && (
          <div className="absolute top-2 left-2 bg-foreground text-background text-[9px] uppercase tracking-widest font-bold px-3 py-1">
            Sale
          </div>
        )}

        {/* Quick Add Overlay - Always visible on mobile, hover on desktop */}
        <div className="absolute bottom-0 left-0 w-full p-0 md:translate-y-full md:opacity-0 opacity-100 translate-y-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 ease-out z-10">
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
            className="w-full h-12 rounded-none bg-black text-white hover:bg-black/90 font-semibold tracking-widest text-[10px] uppercase border-none"
          />
        </div>
      </div>
      
      <div className="flex flex-col flex-1 relative z-20 bg-white">
        <Link href={`/products/${slug}`} className="transition-opacity mb-2">
          {product.brand && (
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 font-bold">{product.brand}</p>
          )}
          <h3 className="font-semibold line-clamp-1 text-sm text-foreground tracking-tight">{product.name}</h3>
        </Link>
        
        <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="font-medium text-sm text-foreground tracking-tight">₹{(product.discountPrice / 100).toLocaleString()}</span>
                <span className="text-[11px] line-through text-muted-foreground">₹{(product.price / 100).toLocaleString()}</span>
              </>
            ) : (
              <span className="font-medium text-sm text-foreground tracking-tight">₹{(product.price / 100).toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
