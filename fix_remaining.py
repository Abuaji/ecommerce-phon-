import os

replacements = {
    "src/components/admin/order-status-updater.tsx": [
        ('  PROCESSING: ["PACKED", "SHIPPED", "CANCELLED"],\n', '')
    ],
    "src/components/admin/trust-badges-client.tsx": [
        ('function BadgeCard({ badge, onEdit, onDelete, onToggle }: {\n  badge: BadgeItem;\n  onEdit: (b: BadgeItem) => void;\n  onDelete: (id: string) => void;\n  onToggle: (id: string, active: boolean) => void;\n}) {\n  const [, startTransition] = useTransition();', 'function BadgeCard({ badge, onEdit, onDelete, onToggle }: {\n  badge: BadgeItem;\n  onEdit: (b: BadgeItem) => void;\n  onDelete: (id: string) => void;\n  onToggle: (id: string, active: boolean) => void;\n}) {\n  const [isPending, startTransition] = useTransition();'),
        ('}) {\n  const [form, setForm] = useState<FormState>(initialData ?? { ...EMPTY_FORM, displayOrder: nextOrder });\n  const [, startTransition] = useTransition();', '}) {\n  const [form, setForm] = useState<FormState>(initialData ?? { ...EMPTY_FORM, displayOrder: nextOrder });\n  const [isPending, startTransition] = useTransition();')
    ],
    "src/components/layouts/admin/sidebar.tsx": [
        ('ChevronLeft, Tag, RotateCcw, Star, Bell,', 'Tag, RotateCcw, Star, Bell,'),
        ('Landmark, Zap, Bookmark, BadgeCheck', 'Zap, Bookmark, BadgeCheck')
    ],
    "src/components/layouts/store/header.tsx": [
        ('import { usePathname } from "next/navigation";\n', '')
    ],
    "src/components/store/search-command.tsx": [
        ('import { useRouter } from "next/navigation";\n', '')
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
