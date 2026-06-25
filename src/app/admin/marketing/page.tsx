import { adminGetCoupons } from "@/actions/admin/coupon.actions";
import { adminGetBanners } from "@/actions/admin/banner.actions";
import { requirePermission } from "@/lib/auth-utils";
import { CouponsClient } from "@/components/admin/coupons-client";
import { CampaignClient } from "@/components/admin/campaign-client";
import { BannersClient } from "@/components/admin/banners-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 0;

export default async function MarketingPage() {
  await requirePermission("MARKETING", "VIEW");
  const [coupons, banners] = await Promise.all([
    adminGetCoupons(),
    adminGetBanners()
  ]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
      </div>
      
      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Hero Banners</TabsTrigger>
          <TabsTrigger value="coupons">Discount Coupons</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="banners" className="space-y-4">
          <BannersClient initialBanners={banners} />
        </TabsContent>
        <TabsContent value="coupons" className="space-y-4">
          <CouponsClient initialCoupons={coupons} />
        </TabsContent>
        <TabsContent value="campaigns" className="space-y-4">
          <CampaignClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
