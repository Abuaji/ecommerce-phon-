import { StoreHeader } from "@/components/layouts/store/header";
import { StoreFooter } from "@/components/layouts/store/footer";
import { BottomNav } from "@/components/layouts/store/bottom-nav";
import { readClient } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY, TOP_SELLING_QUERY, ALL_PRODUCTS_QUERY } from "@/sanity/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, topProducts, allProducts] = await Promise.all([
    readClient.fetch(SITE_SETTINGS_QUERY).catch(() => null),
    readClient.fetch(TOP_SELLING_QUERY).catch(() => []),
    readClient.fetch(ALL_PRODUCTS_QUERY).catch(() => [])
  ]);

  const searchSuggestions = topProducts?.length > 0 ? topProducts : allProducts?.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader settings={settings} searchSuggestions={searchSuggestions} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <StoreFooter settings={settings} />
      <BottomNav />
    </div>
  );
}
