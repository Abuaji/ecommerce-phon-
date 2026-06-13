"use client";

import { useState, useTransition } from "react";
import { adminCreateCoupon } from "@/actions/admin/coupon.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export function CouponFormModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: Parameters<typeof adminCreateCoupon>[0] = {
      code: fd.get("code") as string,
      discountType,
      discountValue: Number(fd.get("discountValue")),
    };
    if (fd.get("minOrderValue")) data.minOrderValue = Number(fd.get("minOrderValue"));
    if (fd.get("maxDiscount")) data.maxDiscount = Number(fd.get("maxDiscount"));
    if (fd.get("usageLimit")) data.usageLimit = Number(fd.get("usageLimit"));
    if (fd.get("startDate")) data.startDate = fd.get("startDate") as string;
    if (fd.get("endDate")) data.endDate = fd.get("endDate") as string;

    startTransition(async () => {
      const result = await adminCreateCoupon(data);
      if (result.error) { setError(result.error); return; }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4 md:p-8">
      <section className="w-full max-w-4xl max-h-full overflow-y-auto p-8 md:p-12 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 shadow-2xl rounded-3xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-50 active:scale-95 transition-all duration-150"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        
        <header className="mb-12">
          <h2 className="text-3xl font-sans font-semibold tracking-tight text-slate-50">
            System Configuration: Coupon
          </h2>
          <p className="font-mono tracking-widest text-xs text-slate-400 uppercase mt-4">
            Create New Promotional SKU
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <div className="font-mono text-xs tracking-widest uppercase text-red-500 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
              [SYS_ERR] {error}
            </div>
          )}
          
          <div className="grid grid-cols-12 gap-6">
            {/* Tile 1: Code */}
            <article className="col-span-12 md:col-span-7 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out flex flex-col justify-center">
              <Label htmlFor="code" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Coupon Code [REQ]
              </Label>
              <Input 
                id="code" 
                name="code" 
                required 
                placeholder="e.g. ALPHA-SAVE" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest uppercase focus:border-slate-700 focus:ring-0 transition-all duration-300" 
              />
            </article>

            {/* Tile 2: Discount Type */}
            <article className="col-span-12 md:col-span-5 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out flex flex-col justify-center">
              <Label className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Discount Mode [REQ]
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {(["PERCENTAGE", "FIXED"] as const).map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    onClick={() => setDiscountType(t)}
                    className={`py-5 rounded-2xl font-mono text-xs uppercase tracking-widest active:scale-95 transition-all duration-150 ${
                      discountType === t 
                        ? "bg-slate-800 border-slate-700 text-slate-50 shadow-inner" 
                        : "bg-slate-950/50 border-slate-800/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-50"
                    } border`}
                  >
                    {t === "PERCENTAGE" ? "Ratio (%)" : "Flat (₹)"}
                  </button>
                ))}
              </div>
            </article>

            {/* Tile 3: Discount Value */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="discountValue" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                {discountType === "PERCENTAGE" ? "Value [%]" : "Value [₹]"} *
              </Label>
              <Input 
                id="discountValue" 
                name="discountValue" 
                type="number" 
                required 
                min={1} 
                placeholder={discountType === "PERCENTAGE" ? "20" : "1000"} 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300" 
              />
            </article>

            {/* Tile 4: Min Order */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="minOrderValue" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Min Volume [PAISE]
              </Label>
              <Input 
                id="minOrderValue" 
                name="minOrderValue" 
                type="number" 
                placeholder="50000" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300" 
              />
            </article>

            {/* Tile 5: Max Discount */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="maxDiscount" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Max Cap [PAISE]
              </Label>
              <Input 
                id="maxDiscount" 
                name="maxDiscount" 
                type="number" 
                placeholder="20000" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300" 
              />
            </article>

            {/* Tile 6: Usage Limit */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="usageLimit" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Usage Quota [INT]
              </Label>
              <Input 
                id="usageLimit" 
                name="usageLimit" 
                type="number" 
                placeholder="UNLIMITED" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300" 
              />
            </article>

            {/* Tile 7: Start Date */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="startDate" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Activation [DATE]
              </Label>
              <Input 
                id="startDate" 
                name="startDate" 
                type="date" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300 [color-scheme:dark]" 
              />
            </article>

            {/* Tile 8: End Date */}
            <article className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 ease-out">
              <Label htmlFor="endDate" className="font-mono uppercase tracking-widest text-xs text-slate-400 mb-4 block">
                Expiration [DATE]
              </Label>
              <Input 
                id="endDate" 
                name="endDate" 
                type="date" 
                className="w-full bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-600 rounded-2xl px-5 py-6 font-mono tracking-widest focus:border-slate-700 transition-all duration-300 [color-scheme:dark]" 
              />
            </article>
          </div>
          
          <nav className="flex gap-6 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 py-8 rounded-3xl border-slate-800 bg-transparent text-slate-400 font-sans tracking-tight hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-50 active:scale-95 transition-all duration-300 ease-out" 
              onClick={onClose}
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              className="flex-1 py-8 rounded-3xl bg-slate-900 border border-red-500/50 text-red-500 font-sans tracking-tight font-semibold shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:bg-red-500/10 hover:border-red-500 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed uppercase" 
              disabled={isPending}
            >
              {isPending ? "INITIALISING..." : "DEPLOY CONFIGURATION"}
            </Button>
          </nav>
        </form>
      </section>
    </div>
  );
}
