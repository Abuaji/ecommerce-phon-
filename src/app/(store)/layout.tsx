import { StoreHeader } from "@components/layouts/store/header";
import { StoreFooter } from "@components/layouts/store/footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
