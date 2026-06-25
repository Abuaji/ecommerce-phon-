"use client";

import { Search, Bell, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AdminTopBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40 flex flex-col">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search Placeholder */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
            placeholder="Search products, orders, or customers... (Cmd+K)"
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary"></span>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border/60" aria-hidden="true" />

          {/* Profile Dropdown Placeholder */}
          <button className="-m-1.5 flex items-center p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-4 text-sm font-semibold leading-6" aria-hidden="true">
                Admin User
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
