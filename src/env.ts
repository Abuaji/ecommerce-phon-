import { z } from "zod";

/**
 * Define your server-side environment variables schema here.
 * These will never be exposed to the browser.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  // NextAuth v5 uses AUTH_URL, but NEXTAUTH_URL is also common
  AUTH_URL: z.string().url().optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_WRITE_TOKEN: z.string().optional(),
});

/**
 * Define your client-side environment variables schema here.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).regex(/^[a-z0-9-]+$/, "Sanity Project ID can only contain a-z, 0-9 and dashes"),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
});

// Create a unified process.env object to parse
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
};

let env: z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

// Validate the environment variables
// Skip validation during build steps if needed, but it's good practice to validate
if (process.env.SKIP_ENV_VALIDATION === "true" || process.env.npm_lifecycle_event === "build") {
  env = processEnv as any;
} else {
  try {
    const parsedServer = serverSchema.parse(processEnv);
    const parsedClient = clientSchema.parse(processEnv);

    env = { ...parsedServer, ...parsedClient };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
      throw new Error("Invalid environment variables");
    }
    throw error;
  }
}

export { env };
