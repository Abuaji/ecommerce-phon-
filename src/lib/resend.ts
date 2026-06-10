import { Resend } from "resend";
import { env } from "@/env";

// Initialize Resend email client
export const resend = new Resend(env.RESEND_API_KEY);
