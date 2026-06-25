"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export function SearchCommand({ suggestions = [], iconMode = false }: { suggestions?: any[], iconMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const displaySuggestions = suggestions?.length > 0 ? suggestions : [];
  const recommended = displaySuggestions.length > 0 ? displaySuggestions[0] : null;
  const popular = displaySuggestions.slice(1, 7);

  const formatPrice = (priceInCents: number) => {
    const formatted = (priceInCents / 100).toFixed(2);
    return formatted.split(".");
  };

  return (
    <div className={iconMode ? "relative" : "relative w-full max-w-xl"} ref={containerRef}>
      {/* Dim Overlay when open */}
      {open && !iconMode && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Trigger */}
      {iconMode ? (
        <div 
          onClick={() => setOpen(true)} 
          className="relative flex items-center gap-2 px-4 py-2 w-[180px] lg:w-[240px] bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 rounded-full transition-colors cursor-text"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium">Search...</span>
        </div>
      ) : (
        <div className={`relative z-50 flex items-center bg-white rounded-full px-4 h-12 w-full shadow-sm transition-all duration-300 ${open ? 'ring-4 ring-white/20' : ''}`}>
          <input 
            type="text" 
            placeholder="Search for cases, chargers, audio..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-sm pl-2"
            onFocus={() => setOpen(true)}
            ref={inputRef}
          />
          <button className="p-2 text-gray-500 hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Popover Dropdown */}
      {open && (
        <div className={iconMode ? "absolute top-[calc(100%+12px)] right-0 w-[350px] bg-white rounded-[24px] shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200" : "absolute top-[calc(100%+12px)] left-0 w-full md:w-[120%] md:-ml-[10%] bg-white rounded-[24px] shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200"}>
          
          {iconMode && (
            <div className="mb-6">
              <div className="flex items-center bg-muted/50 rounded-full px-4 h-12 w-full">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                  ref={inputRef}
                />
                <Search className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          )}
          
          {recommended && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Recommended searches</h3>
              <Link href={`/products/${recommended.slug?.current || recommended.slug}`} onClick={() => setOpen(false)}>
                <div className="bg-muted/50 p-2 rounded-xl flex items-center gap-3 w-fit cursor-pointer hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
                    {recommended.imageUrl ? (
                      <Image src={recommended.imageUrl} alt={recommended.name} width={40} height={40} className="object-contain w-full h-full mix-blend-multiply" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{recommended.name}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">
                      ₹{formatPrice(recommended.price)[0]}.<sup className="text-[9px]">{formatPrice(recommended.price)[1]}</sup>
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {popular.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Popular search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popular.map((item: any, i: number) => (
                  <Link key={i} href={`/products/${item.slug?.current || item.slug}`} onClick={() => setOpen(false)}>
                    <div className="bg-muted/50 p-2 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-contain w-full h-full mix-blend-multiply" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">
                          ₹{formatPrice(item.price)[0]}.<sup className="text-[9px]">{formatPrice(item.price)[1]}</sup>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
