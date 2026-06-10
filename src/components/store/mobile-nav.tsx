"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold tracking-tighter text-gradient">Lumina</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-6">
          <nav className="flex flex-col gap-4">
            <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>Shop All</Link>
            <Link href="/categories" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>Categories</Link>
            <Link href="/brands" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setOpen(false)}>Brands</Link>
          </nav>
          <div className="h-px bg-border w-full" />
          <nav className="flex flex-col gap-4">
            <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>My Account</Link>
            <Link href="/track-order" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>Track Order</Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
