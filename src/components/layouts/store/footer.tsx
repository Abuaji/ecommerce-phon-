import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-foreground">Lumina</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Premium mobile accessories designed for the modern lifestyle.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-foreground">Shop</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-foreground">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/track-order" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-foreground">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-border flex flex-col justify-between items-center gap-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Lumina. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
