"use client";

import { useState, useTransition } from "react";
import { 
  Truck, ShieldCheck, RotateCcw, Star, CreditCard, Lock, 
  Zap, Gift, Package, CheckCircle2, PhoneCall, Trophy,
  Plus, Pencil, Trash2, GripVertical, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  adminCreateTrustBadge, adminUpdateTrustBadge, 
  adminToggleTrustBadge, adminDeleteTrustBadge 
} from "@/actions/admin/trust-badge.actions";
import { toast } from "sonner";

const ICON_OPTIONS = [
  { value: "Truck",        label: "🚚 Truck (Delivery)",        Icon: Truck },
  { value: "ShieldCheck",  label: "🛡️ Shield Check (Warranty)", Icon: ShieldCheck },
  { value: "RotateCcw",    label: "🔄 Rotate (Returns)",        Icon: RotateCcw },
  { value: "Star",         label: "⭐ Star (Quality)",          Icon: Star },
  { value: "CreditCard",   label: "💳 Credit Card (Payments)",  Icon: CreditCard },
  { value: "Lock",         label: "🔒 Lock (Security)",         Icon: Lock },
  { value: "Zap",          label: "⚡ Zap (Fast)",              Icon: Zap },
  { value: "Gift",         label: "🎁 Gift (Offers)",           Icon: Gift },
  { value: "Package",      label: "📦 Package (Packaging)",     Icon: Package },
  { value: "CheckCircle2", label: "✅ Check (Verified)",        Icon: CheckCircle2 },
  { value: "PhoneCall",    label: "📞 Phone (Support)",         Icon: PhoneCall },
  { value: "Trophy",       label: "🏆 Trophy (Premium)",        Icon: Trophy },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(({ value, Icon }) => [value, Icon])
);

type BadgeItem = {
  _id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
};

type FormState = {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  icon: "ShieldCheck",
  isActive: true,
  displayOrder: 1,
};

function IconPreview({ iconName, size = 5 }: { iconName: string; size?: number }) {
  const Icon = ICON_MAP[iconName] ?? ShieldCheck;
  return <Icon className={`h-${size} w-${size} stroke-[1.25]`} />;
}

function BadgeCard({ badge, onEdit, onDelete, onToggle }: {
  badge: BadgeItem;
  onEdit: (b: BadgeItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className={`transition-all duration-200 ${!badge.isActive ? "opacity-60 border-dashed" : ""}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="cursor-grab text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconPreview iconName={badge.icon} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm truncate">{badge.title}</p>
            <Badge variant="outline" className="text-[10px] shrink-0">
              #{badge.displayOrder}
            </Badge>
            {!badge.isActive && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                Hidden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={badge.isActive}
            disabled={isPending}
            onCheckedChange={(checked) => {
              startTransition(async () => {
                await onToggle(badge._id, checked);
                toast.success(checked ? "Badge is now visible on storefront" : "Badge hidden from storefront");
              });
            }}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(badge)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(badge._id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeForm({
  initialData,
  nextOrder,
  onSubmit,
  onCancel,
  isEditing,
}: {
  initialData?: FormState;
  nextOrder: number;
  onSubmit: (data: FormState) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialData ?? { ...EMPTY_FORM, displayOrder: nextOrder });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    startTransition(async () => {
      await onSubmit(form);
    });
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{isEditing ? "Edit Badge" : "Add New Badge"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the details for this trust badge." : "Create a new trust badge to display on your storefront."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge-title">Title *</Label>
              <Input
                id="badge-title"
                placeholder="e.g. Free Express Delivery"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">{form.title.length}/50</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-desc">Description *</Label>
              <Input
                id="badge-desc"
                placeholder="e.g. On all orders above ₹999"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{form.description.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-icon">Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v ?? "" })}>
                <SelectTrigger id="badge-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-order">Display Order</Label>
              <Input
                id="badge-order"
                type="number"
                min={1}
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Lower = shown first</p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border/40 bg-background p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
              <IconPreview iconName={form.icon} size={6} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-foreground">
                {form.title || "Your Title Here"}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {form.description || "Your description here"}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto text-xs">Preview</Badge>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="badge-active"
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <Label htmlFor="badge-active" className="cursor-pointer">
              {form.isActive ? "Visible on storefront" : "Hidden from storefront"}
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Badge"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function TrustBadgesClient({ initialBadges }: { initialBadges: BadgeItem[] }) {
  const [badges, setBadges] = useState<BadgeItem[]>(initialBadges);
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [, startTransition] = useTransition();

  const handleCreate = async (data: FormState) => {
    const res = await adminCreateTrustBadge(data);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Trust badge created! It is now live on the storefront.");
    setShowForm(false);
    // Optimistic update — reload from server on next navigation
    setBadges(prev => [...prev, { _id: Date.now().toString(), ...data }]);
  };

  const handleUpdate = async (data: FormState) => {
    if (!editingBadge) return;
    const res = await adminUpdateTrustBadge(editingBadge._id, data);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Trust badge updated!");
    setEditingBadge(null);
    setBadges(prev => prev.map(b => b._id === editingBadge._id ? { ...b, ...data } : b));
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await adminToggleTrustBadge(id, isActive);
    if (res.error) { toast.error(res.error); return; }
    setBadges(prev => prev.map(b => b._id === id ? { ...b, isActive } : b));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this trust badge? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await adminDeleteTrustBadge(id);
      if (res.error) { toast.error(res.error); return; }
      toast.success("Trust badge deleted.");
      setBadges(prev => prev.filter(b => b._id !== id));
    });
  };

  const nextOrder = badges.length > 0 ? Math.max(...badges.map(b => b.displayOrder)) + 1 : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {badges.length} badge{badges.length !== 1 ? "s" : ""} • Changes go live instantly
          </p>
        </div>
        {!showForm && !editingBadge && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Badge
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <BadgeForm
          nextOrder={nextOrder}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isEditing={false}
        />
      )}

      {/* Edit form */}
      {editingBadge && (
        <BadgeForm
          initialData={{
            title: editingBadge.title,
            description: editingBadge.description,
            icon: editingBadge.icon,
            isActive: editingBadge.isActive,
            displayOrder: editingBadge.displayOrder,
          }}
          nextOrder={nextOrder}
          onSubmit={handleUpdate}
          onCancel={() => setEditingBadge(null)}
          isEditing={true}
        />
      )}

      {/* Badge list */}
      {badges.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40" />
            <div className="text-center">
              <p className="font-semibold text-foreground">No trust badges yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add trust badges to highlight your store's reliability to customers.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="mt-2 gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Badge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {badges
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((badge) => (
              <BadgeCard
                key={badge._id}
                badge={badge}
                onEdit={(b) => { setEditingBadge(b); setShowForm(false); }}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
          ))}
        </div>
      )}

      {/* Tip */}
      {badges.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          💡 Toggle the switch to instantly show/hide a badge on the storefront without deleting it.
        </p>
      )}
    </div>
  );
}
