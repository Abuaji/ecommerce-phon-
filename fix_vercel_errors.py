import os

replacements = {
    "src/app/(store)/page.tsx": [
        ('import Image from "next/image";', '// import Image from "next/image";'),
        ('import { ChevronRight, Grid } from "lucide-react";', 'import { ChevronRight } from "lucide-react";')
    ],
    "src/app/admin/audit-logs/page.tsx": [
        ('import { Badge } from "@/components/ui/badge";', '// import { Badge } from "@/components/ui/badge";'),
        ('import { AuditAction } from "@prisma/client";', '// import { AuditAction } from "@prisma/client";')
    ],
    "src/app/admin/brands/page.tsx": [
        ('import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";', '// import { Table }'),
        ('import { Badge } from "@/components/ui/badge";', '// import { Badge } from "@/components/ui/badge";')
    ],
    "src/app/admin/dashboard/page.tsx": [
        ('import { PaymentStatus, OrderStatus } from "@prisma/client";', '// import { PaymentStatus, OrderStatus } from "@prisma/client";')
    ],
    "src/app/admin/notifications/page.tsx": [
        ('import { Badge } from "@/components/ui/badge";', '// import { Badge } from "@/components/ui/badge";')
    ],
    "src/app/admin/products/page.tsx": [
        ('import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";', '// import { Table }'),
        ('import { ProductRowActions } from "@/components/admin/product-row-actions";', '// import { ProductRowActions }')
    ],
    "src/app/admin/returns/page.tsx": [
        ('const STATUS_COLORS: Record<string, string> = {', '/* const STATUS_COLORS: Record<string, string> = {'),
        ('  CLOSED: "bg-gray-100 text-gray-800",\n};', '  CLOSED: "bg-gray-100 text-gray-800",\n}; */')
    ],
    "src/app/admin/trust-badges/page.tsx": [
        ('import { BadgeCheck, ShieldCheck, Truck, RotateCcw, PhoneCall } from "lucide-react";', 'import { BadgeCheck, ShieldCheck, Truck, PhoneCall } from "lucide-react";')
    ],
    "src/components/admin/banners-client.tsx": [
        ('import { Badge } from "@/components/ui/badge";', '// import { Badge } from "@/components/ui/badge";')
    ],
    "src/components/admin/order-status-updater.tsx": [
        ('  PROCESSING: "Processing",\n', ''),
        ('  PROCESSING: "bg-indigo-100 text-indigo-800",\n', ''),
        ('CONFIRMED: ["PACKED", "PROCESSING", "CANCELLED"],', 'CONFIRMED: ["PACKED", "CANCELLED"],')
    ],
    "src/components/admin/product-row-actions.tsx": [
        ('import Link from "next/link";', '// import Link from "next/link";')
    ],
    "src/components/admin/trust-badges-client.tsx": [
        ('Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X', 'Plus, Pencil, Trash2, GripVertical, Save, X'),
        ('const res = await onToggle(badge._id, checked);', 'await onToggle(badge._id, checked);'),
        ('const [isPending, startTransition] = useTransition();', 'const [, startTransition] = useTransition();')
    ],
    "src/components/layouts/admin/sidebar.tsx": [
        ('ChevronLeft, Tag, RotateCcw, Star, Bell, BarChart2,', 'ChevronLeft, Tag, RotateCcw, Star, Bell,'),
        ('Landmark, Zap, Search, Bookmark, BadgeCheck', 'Landmark, Zap, Bookmark, BadgeCheck')
    ],
    "src/components/layouts/store/header.tsx": [
        ('const pathname = usePathname();', '// const pathname = usePathname();')
    ],
    "src/components/store/hero-carousel.tsx": [
        ('const [api, setApi] = React.useState<CarouselApi>();', 'const [, setApi] = React.useState<CarouselApi>();')
    ],
    "src/components/store/price-display.tsx": [
        ('import React from "react";', '// import React from "react";')
    ],
    "src/components/store/search-command.tsx": [
        ('const router = useRouter();', '// const router = useRouter();')
    ],
    "src/components/store/top-products-carousel.tsx": [
        ('import * as React from "react";', '// import * as React from "react";')
    ],
    "src/server/services/email.service.ts": [
        (r'\${', '${')
    ],
    "src/tests/razorpay-integration.ts": [
        ('simulateWebhook(checkoutRes.data.razorpayOrderId,', 'simulateWebhook(checkoutRes.data.razorpayOrderId || "",'),
        ('simulateWebhook(checkoutFailRes.data.razorpayOrderId,', 'simulateWebhook(checkoutFailRes.data.razorpayOrderId || "",')
    ]
}

base_dir = "."

for file_path, pairs in replacements.items():
    full_path = os.path.join(base_dir, file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r') as f:
            content = f.read()
        for old, new in pairs:
            content = content.replace(old, new)
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Missing {file_path}")
