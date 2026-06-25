"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingBag, LayoutGrid, Tag, User, Truck, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="md:hidden p-2 text-white hover:bg-white/10 rounded-full cursor-pointer transition-colors" aria-label="Open Menu">
          <Menu className="h-6 w-6" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-background/95 backdrop-blur-xl border-r border-border/40 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/20 text-left">
          <SheetTitle className="text-2xl font-bold tracking-tighter text-foreground">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            <Link href="/products" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-foreground transition-all" onClick={() => setOpen(false)}>
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">Shop All</span>
            </Link>
            <Link href="/categories" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-foreground transition-all" onClick={() => setOpen(false)}>
              <LayoutGrid className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">Categories</span>
            </Link>
            <Link href="/brands" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-foreground transition-all" onClick={() => setOpen(false)}>
              <Tag className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">Brands</span>
            </Link>
          </div>
          
          <div className="my-6 mx-8 h-px bg-border/40" />
          
          <div className="px-4 space-y-1">
            <Link href="/account" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all" onClick={() => setOpen(false)}>
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">My Account</span>
            </Link>
            <Link href="/track-order" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all" onClick={() => setOpen(false)}>
              <Truck className="w-5 h-5" />
              <span className="text-sm font-medium">Track Order</span>
            </Link>
            <Link href="/contact" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all" onClick={() => setOpen(false)}>
              <Phone className="w-5 h-5" />
              <span className="text-sm font-medium">Contact Support</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
