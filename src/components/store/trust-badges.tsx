import { 
  ShieldCheck, Truck, RotateCcw, Star, CreditCard, Lock, 
  Zap, Gift, Package, CheckCircle2, PhoneCall, Trophy 
} from "lucide-react";

// Icon map — keys match what admin picks in Sanity
const ICON_MAP: Record<string, React.ReactNode> = {
  Truck:         <Truck className="h-7 w-7 stroke-[1.25]" />,
  ShieldCheck:   <ShieldCheck className="h-7 w-7 stroke-[1.25]" />,
  RotateCcw:     <RotateCcw className="h-7 w-7 stroke-[1.25]" />,
  Star:          <Star className="h-7 w-7 stroke-[1.25]" />,
  CreditCard:    <CreditCard className="h-7 w-7 stroke-[1.25]" />,
  Lock:          <Lock className="h-7 w-7 stroke-[1.25]" />,
  Zap:           <Zap className="h-7 w-7 stroke-[1.25]" />,
  Gift:          <Gift className="h-7 w-7 stroke-[1.25]" />,
  Package:       <Package className="h-7 w-7 stroke-[1.25]" />,
  CheckCircle2:  <CheckCircle2 className="h-7 w-7 stroke-[1.25]" />,
  PhoneCall:     <PhoneCall className="h-7 w-7 stroke-[1.25]" />,
  Trophy:        <Trophy className="h-7 w-7 stroke-[1.25]" />,
};

type Badge = {
  _id?: string;
  icon: string;
  title: string;
  description: string;
};

// Shown when the CMS has no trust badges yet — keeps the site looking great
const FALLBACK_BADGES: Badge[] = [
  { icon: "Truck",       title: "Free Express Delivery", description: "On all orders above ₹999" },
  { icon: "ShieldCheck", title: "1-Year Warranty",       description: "Premium quality guaranteed" },
  { icon: "RotateCcw",   title: "Easy Returns",          description: "14-day hassle-free returns" },
  { icon: "PhoneCall",   title: "24/7 Support",          description: "We are always here to help" },
];

export function TrustBadges({ badges }: { badges?: Badge[] }) {
  const displayBadges = badges && badges.length > 0 ? badges : FALLBACK_BADGES;
  const colCount = Math.min(displayBadges.length, 4);

  const gridColsClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[colCount] || 'md:grid-cols-4';

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:gap-6 py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-0 ${gridColsClass}`}
    >
      {displayBadges.map((badge, idx) => (
        <div
          key={badge._id ?? idx}
          className="group relative flex flex-col items-center text-center p-4 sm:p-10 rounded-2xl sm:rounded-3xl bg-zinc-50/80 border border-border/40 hover:bg-zinc-100 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] group-hover:to-black/[0.04] transition-colors duration-500 pointer-events-none" />

          <div className="text-foreground/80 group-hover:text-foreground group-hover:scale-110 transition-all duration-500 mb-3 sm:mb-6 relative z-10">
            {ICON_MAP[badge.icon] ?? <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.25]" />}
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <h4 className="text-[9px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] font-bold text-foreground mb-1.5 sm:mb-3">
              {badge.title}
            </h4>
            <p className="text-[10px] sm:text-[13px] text-muted-foreground max-w-[200px] leading-snug sm:leading-relaxed">
              {badge.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
