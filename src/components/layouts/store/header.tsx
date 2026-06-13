"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User } from "lucide-react";
import { MobileNav } from "@/components/store/mobile-nav";
import { SearchCommand } from "@/components/store/search-command";
import { useCartStore } from "@/stores/cart.store";

export function StoreHeader() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/brands", label: "Brands" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="w-full bg-foreground text-background py-2.5 text-center text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center">
        <p>Free Shipping · Orders over ₹999 · Premium Packaging</p>
      </div>
      
      {/* Main Header */}
      <header className="w-full border-b border-border/60 bg-background/98 backdrop-blur-sm">
        <div className="container mx-auto flex h-[68px] items-center justify-between px-4 lg:px-8">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-sans font-medium tracking-tight text-foreground uppercase">Antigravity</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[12px] uppercase tracking-[0.2em] font-semibold transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <SearchCommand />
          <Link 
            href="/account" 
            className="p-2 text-foreground hover:opacity-70 transition-opacity" 
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px] stroke-[1.5]" />
          </Link>
          <Link 
            href="/cart" 
            className="p-2 text-foreground hover:opacity-70 transition-opacity relative" 
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center bg-black text-[9px] font-bold text-white rounded-none">
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
