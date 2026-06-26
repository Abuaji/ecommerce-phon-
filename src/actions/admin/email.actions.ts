"use server";

import { requirePermission } from "@/lib/auth-utils";
import { EmailService } from "@/server/services/email.service";

export async function adminSendCustomEmail(recipientEmail: string, subject: string, message: string) {
  // Require SETTINGS or ORDERS permission to send custom emails
  await requirePermission("ORDERS", "UPDATE");

  try {
    const result = await EmailService.sendCustomEmail(recipientEmail, subject, message);
    
    if (!result.success) {
      return { error: "Failed to send email. Provider error." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending custom email:", error);
    return { error: "Failed to send custom email." };
  }
}

export async function adminSendBulkCampaign(subject: string, message: string) {
  // Requires MARKETING permission to send campaigns
  await requirePermission("MARKETING", "CREATE");

  try {
    const { prisma } = await import("@/lib/db");
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (!customers.length) return { error: "No active customers found." };

    // Deduplicate emails using explicit loop — avoids Set spread inference issues
    const seenEmails = new Set<string>();
    const uniqueEmails: string[] = [];
    for (const customer of customers) {
      const email: string = customer.email;
      if (!seenEmails.has(email)) {
        seenEmails.add(email);
        uniqueEmails.push(email);
      }
    }

    // Process in batches of 10 to avoid overwhelming the provider
    for (let i = 0; i < uniqueEmails.length; i += 10) {
      const batch: string[] = uniqueEmails.slice(i, i + 10);
      await Promise.allSettled(
        batch.map((email: string) => EmailService.sendCustomEmail(email, subject, message))
      );
    }

    return { success: true, count: uniqueEmails.length };
  } catch (error) {
    console.error("Error sending bulk campaign:", error);
    return { error: "Failed to start bulk campaign." };
  }
}
