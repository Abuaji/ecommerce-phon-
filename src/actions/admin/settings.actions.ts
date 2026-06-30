"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const DEFAULT_SETTINGS = [
  { key: "store_name", value: "Lumina", label: "Store Name", description: "The public name of your store", group: "general" },
  { key: "store_tagline", value: "Mobile Accessories for Everyone", label: "Store Tagline", description: "Short description shown in headers", group: "general" },
  { key: "contact_email", value: "support@lumina.com", label: "Support Email", description: "Customer-facing support email address", group: "general" },
  { key: "contact_phone", value: "+91 98765 43210", label: "Support Phone", description: "Customer-facing phone number", group: "general" },
  { key: "free_shipping_threshold", value: "50000", label: "Free Shipping Threshold (paise)", description: "Orders above this amount get free shipping (in paise, e.g. 50000 = ₹500)", group: "shipping" },
  { key: "default_currency", value: "INR", label: "Default Currency", description: "ISO currency code (e.g. INR, USD)", group: "general" },
  { key: "low_stock_alert_threshold", value: "10", label: "Low Stock Alert Threshold", description: "Alert when stock falls below this number", group: "general" },
  { key: "razorpay_enabled", value: "true", label: "Razorpay Enabled", description: "Enable Razorpay payment gateway", group: "payments" },
  { key: "cod_enabled", value: "true", label: "Cash on Delivery Enabled", description: "Allow Cash on Delivery as a payment method", group: "payments" },
  { key: "order_notification_email", value: "orders@lumina.com", label: "Order Notification Email", description: "Internal email to receive new order alerts", group: "notifications" },
  { key: "enable_order_confirm_emails", value: "true", label: "Enable Order Confirmations", description: "Automatically send order confirmation emails upon successful checkout", group: "notifications" },
  { key: "enable_shipping_emails", value: "true", label: "Enable Shipping Notifications", description: "Automatically send shipping emails when order status changes to SHIPPED", group: "notifications" },
  { key: "enable_delivery_emails", value: "true", label: "Enable Delivery Notifications", description: "Automatically send delivery emails when order status changes to DELIVERED", group: "notifications" },
  { key: "email_store_name", value: "LUMINA STORE", label: "Email Brand Name", description: "The brand name displayed in the header of automated emails", group: "email" },
  { key: "email_brand_color", value: "#000000", label: "Email Brand Color", description: "Hex color code for email headers and buttons (e.g. #000000 or #be185d)", group: "email" },
  // Pages Configuration
  { key: "about_hero_headline", value: "Our Story", label: "About Hero Headline", description: "The main headline displayed on the About page", group: "pages" },
  { key: "about_mission_statement", value: "Providing the best mobile accessories to empower your digital life.", label: "About Mission Statement", description: "Short summary on the About page", group: "pages" },
  { key: "about_story", value: "We started in a small garage with a big dream...", label: "Our Story Text", description: "The main body content of the About page", group: "pages", isMultiline: true },
  { key: "contact_description", value: "We'd love to hear from you!", label: "Contact Description", description: "Short text on the Contact page", group: "pages" },
  { key: "contact_address", value: "123 Tech Lane, Silicon Valley, CA 94025", label: "Business Address", description: "The physical address displayed on the Contact page", group: "pages", isMultiline: true },
  { key: "contact_business_hours", value: "Mon-Fri, 9am - 6pm EST", label: "Business Hours", description: "e.g. Mon-Fri, 9am - 6pm EST", group: "pages" },
  // Social Links
  { key: "social_instagram", value: "https://instagram.com", label: "Instagram URL", description: "Link to your Instagram profile", group: "social" },
  { key: "social_twitter", value: "https://twitter.com", label: "Twitter / X URL", description: "Link to your Twitter profile", group: "social" },
  { key: "social_facebook", value: "https://facebook.com", label: "Facebook URL", description: "Link to your Facebook page", group: "social" },
  { key: "social_youtube", value: "https://youtube.com", label: "YouTube URL", description: "Link to your YouTube channel", group: "social" },
];

export async function adminGetSettings() {
  await requirePermission("SETTINGS", "VIEW");
  const existing = await prisma.storeSetting.findMany();
  const existingMap = new Map(existing.map(s => [s.key, s]));
  // Merge defaults with DB values
  return DEFAULT_SETTINGS.map(def => ({
    ...def,
    value: existingMap.get(def.key)?.value ?? def.value,
    updatedAt: existingMap.get(def.key)?.updatedAt ?? null,
    updatedBy: existingMap.get(def.key)?.updatedBy ?? null,
  }));
}

export async function getPublicSettings() {
  let existing: any[] = [];
  try {
    // If DB is unreachable during build (e.g. missing DATABASE_URL), fallback gracefully
    existing = await prisma.storeSetting.findMany();
  } catch (error) {
    console.warn("Could not fetch store settings from DB (likely during build). Using defaults.");
  }
  
  const existingMap = new Map(existing.map(s => [s.key, s]));
  return DEFAULT_SETTINGS.map(def => ({
    ...def,
    value: existingMap.get(def.key)?.value ?? def.value,
  }));
}

export async function adminUpsertSetting(key: string, value: string) {
  await requirePermission("SETTINGS", "UPDATE");
  const session = await auth();
  const adminId = session?.user?.id;

  const def = DEFAULT_SETTINGS.find(s => s.key === key);
  if (!def) return { error: "Unknown setting key" };

  await prisma.storeSetting.upsert({
    where: { key },
    update: { value, updatedBy: adminId ?? null },
    create: {
      key,
      value,
      label: def.label,
      description: def.description,
      group: def.group,
      updatedBy: adminId ?? null,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
