import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, ChevronLeft } from "lucide-react";

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tighter text-gradient">Lumina Admin</span>
        </Link>
        <button className="text-muted-foreground hover:text-foreground md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid gap-1 px-4">
          <li>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Orders</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/customers"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Customers</span>
            </Link>
          </li>
          <li className="space-y-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground font-medium select-none">
              <Package className="h-4 w-4" />
              <span className="text-sm">Products</span>
            </div>
            <ul className="grid gap-1 ml-5 border-l border-border/40 pl-2">
              <li>
                <Link
                  href="/admin/products"
                  className="flex items-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products/import"
                  className="flex items-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm"
                >
                  Bulk Import
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/import-history"
                  className="flex items-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm"
                >
                  Import History
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div className="mt-auto border-t border-border/40 p-4">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
