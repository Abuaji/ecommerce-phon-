"use client";

import Link from "next/link";
import { ShoppingBag, ShoppingCart, Zap, User } from "lucide-react";
import { MobileNav } from "@/components/store/mobile-nav";
import { SearchCommand } from "@/components/store/search-command";
import { useCartStore } from "@/stores/cart.store";

export function StoreHeader({ settings, searchSuggestions }: { settings?: any, searchSuggestions?: any[] }) {
  // const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="sticky top-4 z-50 w-full px-4 lg:px-8 mb-8">
      <header className="mx-auto w-full max-w-7xl rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300">
        <div className="flex h-[72px] items-center justify-between px-4 lg:px-6">
          
          {/* Mobile Menu, Logo & Search */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-white">
                <MobileNav />
              </div>
              <Link href="/" className="flex items-center gap-2 group">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings?.brandName || "Lumina"} className="h-8 object-contain" />
                ) : (
                  <span className="text-xl lg:text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    {settings?.brandName || "Lumina"}
                  </span>
                )}
              </Link>
            </div>

            {/* Search Button (Desktop) */}
            <div className="hidden md:block">
              {searchSuggestions ? (
                <SearchCommand suggestions={searchSuggestions} iconMode={true} />
              ) : (
                <SearchCommand iconMode={true} />
              )}
            </div>
          </div>

          {/* Centered Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center gap-8 text-sm font-semibold text-white/90">
            <Link href="/products" className="hover:text-white transition-colors">Shop</Link>
            <Link href="/products?sort=bestselling" className="hover:text-white transition-colors">Best Sellers</Link>
            <Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Actions & Promo */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* Promo Text */}
            {settings?.promoText && (
              <div className="hidden xl:flex items-center gap-2 text-sm font-medium text-white/90 mr-4">
                <Zap className="w-4 h-4 text-accent fill-accent animate-pulse" />
                <span dangerouslySetInnerHTML={{ __html: settings.promoText }} />
              </div>
            )}
            
            {/* Account Button (Desktop) */}
            <Link
              href="/account"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>

            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative flex items-center gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-medium" 
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden md:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center bg-destructive text-[10px] font-bold text-white rounded-full ring-2 ring-primary">
                  {cartItemCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </header>
    </div>
  );
}
