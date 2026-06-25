import { BadgeCheck } from "lucide-react";

// Available icon names (using Lucide icon names so admin picks from a list)
const ICON_OPTIONS = [
  { title: "🚚 Truck (Delivery)", value: "Truck" },
  { title: "🛡️ Shield Check (Warranty)", value: "ShieldCheck" },
  { title: "🔄 Rotate (Returns)", value: "RotateCcw" },
  { title: "⭐ Star (Quality)", value: "Star" },
  { title: "💳 Credit Card (Payments)", value: "CreditCard" },
  { title: "🔒 Lock (Security)", value: "Lock" },
  { title: "⚡ Zap (Fast)", value: "Zap" },
  { title: "🎁 Gift (Offers)", value: "Gift" },
  { title: "📦 Package (Packaging)", value: "Package" },
  { title: "✅ Check Circle (Verified)", value: "CheckCircle2" },
  { title: "📞 Phone (Support)", value: "PhoneCall" },
  { title: "🏆 Trophy (Premium)", value: "Trophy" },
];

export const trustBadge = {
  name: "trustBadge",
  title: "Trust Badge",
  type: "document",
  icon: BadgeCheck,
  groups: [
    { name: "content", title: "Content" },
    { name: "visibility", title: "Visibility" },
  ],
  fields: [
    // --- CONTENT ---
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "Short label shown on the badge card. E.g., 'Free Delivery'",
      validation: (Rule: any) => Rule.required().max(50),
    },
    {
      name: "description",
      title: "Description",
      type: "string",
      group: "content",
      description: "Short supporting text. E.g., 'On all orders above ₹999'",
      validation: (Rule: any) => Rule.required().max(100),
    },
    {
      name: "icon",
      title: "Icon",
      type: "string",
      group: "content",
      description: "Choose an icon to represent this badge.",
      options: {
        list: ICON_OPTIONS,
        layout: "dropdown",
      },
      initialValue: "ShieldCheck",
      validation: (Rule: any) => Rule.required(),
    },

    // --- VISIBILITY ---
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      group: "visibility",
      description: "Toggle to show or hide this badge on the storefront.",
      initialValue: true,
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "visibility",
      description: "Lower numbers appear first. Use 1, 2, 3...",
      initialValue: 1,
      validation: (Rule: any) => Rule.required().integer().min(1),
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      isActive: "isActive",
      order: "displayOrder",
    },
    prepare({ title, subtitle, isActive, order }: any) {
      return {
        title: `${order}. ${title || "Untitled Badge"}`,
        subtitle: `${subtitle || "No description"} ${isActive ? "✅" : "❌ Hidden"}`,
      };
    },
  },
};
