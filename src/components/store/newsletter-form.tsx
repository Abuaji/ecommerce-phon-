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
        <h4 className="text-xl font-medium text-foreground mb-2">Thank you for subscribing.</h4>
        <p className="text-muted-foreground">Keep an eye on your inbox for exclusive offers.</p>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 text-center max-w-2xl mx-auto">
      <h3 className="text-3xl font-medium tracking-tight mb-4 text-foreground">Join the Club</h3>
      <p className="text-muted-foreground mb-8 text-lg">
        Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto border border-border">
        <Input 
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-0 shadow-none h-14 rounded-none focus-visible:ring-0 px-6 text-base"
        />
        <Button 
          type="submit" 
          disabled={status === "loading"}
          className="h-14 rounded-none px-8 bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-xs font-semibold"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}
