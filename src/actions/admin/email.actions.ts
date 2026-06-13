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
