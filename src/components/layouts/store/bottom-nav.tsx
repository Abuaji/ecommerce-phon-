"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Search },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: cartItemCount },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
