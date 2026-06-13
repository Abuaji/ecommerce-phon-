import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: <Truck className="h-6 w-6 stroke-[1]" />,
      title: "Free Express Delivery",
      description: "On all orders above ₹999",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 stroke-[1]" />,
      title: "1-Year Warranty",
      description: "Premium quality guaranteed",
    },
    {
      icon: <RotateCcw className="h-6 w-6 stroke-[1]" />,
      title: "Easy Returns",
      description: "14-day hassle-free returns",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 max-w-5xl mx-auto">
      {badges.map((badge, idx) => (
        <div key={idx} className="group relative flex flex-col items-center text-center p-10 rounded-3xl bg-zinc-50/80 border border-border/40 hover:bg-zinc-100 transition-all duration-500 overflow-hidden">
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] group-hover:to-black/[0.04] transition-colors duration-500 pointer-events-none" />
          
          <div className="text-foreground/80 group-hover:text-foreground group-hover:scale-110 transition-all duration-500 mb-6 relative z-10">
            {badge.icon}
          </div>
          <div className="relative z-10">
            <h4 className="text-[11px] uppercase tracking-[0.15em] font-bold text-foreground mb-3">{badge.title}</h4>
            <p className="text-[13px] text-muted-foreground max-w-[200px] leading-relaxed">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
