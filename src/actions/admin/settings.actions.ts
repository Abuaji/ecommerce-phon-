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

export async function adminUpsertSetting(key: string, value: string) {
  await requirePermission("SETTINGS", "UPDATE");
  const session = await auth();
  const adminId = session?.user?.id;

  const def = DEFAULT_SETTINGS.find(s => s.key === key);
  if (!def) return { error: "Unknown setting key" };

  await prisma.storeSetting.upsert({
    where: { key },
    update: { value, updatedBy: adminId },
    create: {
      key,
      value,
      label: def.label,
      description: def.description,
      group: def.group,
      updatedBy: adminId,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
