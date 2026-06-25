"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Settings,
  Tag, RotateCcw, Star, Bell,
  ScrollText, TrendingUp, FolderTree, Layers, FileUp, History,
  Zap, Bookmark, BadgeCheck
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Reports & Insights", href: "/admin/reports", icon: <TrendingUp className="h-4 w-4" /> },
  {
    label: "Operations", icon: <Package className="h-4 w-4" />,
    children: [
      { label: "Orders", href: "/admin/orders", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
      { label: "Returns", href: "/admin/returns", icon: <RotateCcw className="h-3.5 w-3.5" /> },
      { label: "Stock Levels", href: "/admin/inventory", icon: <Package className="h-3.5 w-3.5" /> },
      { label: "Bulk Import", href: "/admin/products/import", icon: <FileUp className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Catalog", icon: <Tag className="h-4 w-4" />,
    children: [
      { label: "Products", href: "/admin/products", icon: <Package className="h-3.5 w-3.5" /> },
      { label: "Categories", href: "/admin/categories", icon: <FolderTree className="h-3.5 w-3.5" /> },
      { label: "Brands", href: "/admin/brands", icon: <Bookmark className="h-3.5 w-3.5" /> },
    ]
  },
  {
    label: "Customers", icon: <Users className="h-4 w-4" />,
    children: [
      { label: "Directory", href: "/admin/customers", icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Reviews", href: "/admin/reviews", icon: <Star className="h-3.5 w-3.5" /> },
    ]
  },
  {
    label: "Marketing", icon: <Zap className="h-4 w-4" />,
    children: [
      { label: "Banners & Coupons", href: "/admin/marketing", icon: <Zap className="h-3.5 w-3.5" /> },
      { label: "Trust Badges", href: "/admin/trust-badges", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
    ]
  },
  { label: "CMS / Content", href: "/admin/studio", icon: <Layers className="h-4 w-4" /> },
  {
    label: "System", icon: <Settings className="h-4 w-4" />,
    children: [
      { label: "Notifications", href: "/admin/notifications", icon: <Bell className="h-3.5 w-3.5" /> },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: <ScrollText className="h-3.5 w-3.5" /> },
      { label: "Import History", href: "/admin/import-history", icon: <History className="h-3.5 w-3.5" /> },
    ]
  }
];

import { useState, useEffect } from "react";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const hasChildren = !!item.children;
  const anyChildActive = item.children ? item.children.some(c => c.href && (pathname === c.href || pathname.startsWith(c.href + "/"))) : false;
  
  const [isOpen, setIsOpen] = useState(anyChildActive);

  // Auto-open if navigating to a child
  useEffect(() => {
    if (anyChildActive) setIsOpen(true);
  }, [anyChildActive]);

  if (hasChildren) {
    return (
      <li className="space-y-0.5">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between rounded-lg px-3 py-2 font-medium select-none text-sm cursor-pointer transition-all ${
            anyChildActive ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <span className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <ul className="overflow-hidden">
            <div className="grid gap-0.5 ml-4 border-l border-border/40 pl-3 mt-0.5">
              {item.children!.map((child) => (
                <NavLink key={child.href} item={child} pathname={pathname} />
              ))}
            </div>
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href!}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

export function SidebarContent() {
  const pathname = usePathname();
  
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tighter">Lumina Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid gap-0.5 px-3">
          {NAV.map((item) => (
            <NavLink key={item.href || item.label} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-border/40 p-3">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
            pathname === "/admin/settings"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent />
    </aside>
  );
}


