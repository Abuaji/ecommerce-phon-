"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground/5 border border-border mb-4">
          <span className="text-base">✓</span>
          <h4 className="text-sm font-semibold text-foreground tracking-tight">You're subscribed!</h4>
        </div>
        <p className="text-muted-foreground text-sm">Keep an eye on your inbox for exclusive offers.</p>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 text-center max-w-4xl mx-auto bg-zinc-950 text-white rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
      {/* Background elegant gradient/glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 px-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-6">Stay in the loop</p>
        <h3 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white" style={{letterSpacing: '-0.03em'}}>Join the Club</h3>
        <p className="text-zinc-400 mb-10 text-base max-w-sm mx-auto leading-relaxed">
          Special offers, free giveaways, and once-in-a-lifetime deals.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-white/20 focus-visible:border-white/30 text-sm px-6 transition-all"
            required
            disabled={status === "loading"}
          />
          <Button 
            type="submit" 
            className="rounded-full h-12 px-8 bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest text-xs uppercase shadow-md transition-all hover:scale-[1.02]"
            disabled={status === "loading"}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </div>
  );
}
