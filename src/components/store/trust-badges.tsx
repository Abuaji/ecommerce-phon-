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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center gap-5">
          <div className="text-foreground">
            {badge.icon}
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] font-bold text-foreground mb-2">{badge.title}</h4>
            <p className="text-[13px] text-muted-foreground">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
