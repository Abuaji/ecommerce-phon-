"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    // In a real app, you'd navigate or perform a search
    if (value === "products") {
      router.push("/products");
    }
  };

  return (
    <>
      <button 
        className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, brands, categories..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleSelect("products")}>
              All Products
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("premium-audio")}>
              Premium Audio
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("charging")}>
              Fast Chargers
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("cases")}>
              Protective Cases
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
