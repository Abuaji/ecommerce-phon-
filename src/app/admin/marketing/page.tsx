import { adminGetCoupons } from "@/actions/admin/coupon.actions";
import { requirePermission } from "@/lib/auth-utils";
import { CouponsClient } from "@/components/admin/coupons-client";

export const revalidate = 0;

export default async function MarketingPage() {
  await requirePermission("MARKETING", "VIEW");
  const coupons = await adminGetCoupons();
  return <CouponsClient initialCoupons={coupons} />;
}
