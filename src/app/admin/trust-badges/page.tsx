import { requirePermission } from "@/lib/auth-utils";
import { adminGetTrustBadges } from "@/actions/admin/trust-badge.actions";
import { TrustBadgesClient } from "@/components/admin/trust-badges-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck, Truck, RotateCcw, PhoneCall } from "lucide-react";

export const revalidate = 0;

export default async function TrustBadgesPage() {
  await requirePermission("MARKETING", "VIEW");
  const badges = await adminGetTrustBadges();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BadgeCheck className="h-8 w-8 text-primary" />
            Trust Badges
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the trust badges displayed on your homepage and product pages.
            These build customer confidence and improve conversions.
          </p>
        </div>
      </div>

      {/* Storefront Preview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Truck className="h-5 w-5 stroke-[1.25]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Example</p>
              <p className="text-xs text-muted-foreground">Free Delivery</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="h-5 w-5 stroke-[1.25]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Example</p>
              <p className="text-xs text-muted-foreground">1-Year Warranty</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <PhoneCall className="h-5 w-5 stroke-[1.25]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Example</p>
              <p className="text-xs text-muted-foreground">24/7 Support</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main manager */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Badges</CardTitle>
          <CardDescription>
            Add up to 4 badges. Use display order to control which shows first.
            Toggle the switch to instantly show or hide without deleting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrustBadgesClient initialBadges={badges} />
        </CardContent>
      </Card>
    </div>
  );
}
