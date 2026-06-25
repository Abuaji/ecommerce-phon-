import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

import { readClient } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readClient.fetch(SITE_SETTINGS_QUERY).catch(() => null);
  
  return {
    title: settings?.globalSeoTitle || "Antigravity | Premium Mobile Accessories",
    description: settings?.globalSeoDescription || "Precision-engineered gear for your devices.",
    openGraph: settings?.defaultOpenGraphImageUrl ? {
      images: [{ url: settings.defaultOpenGraphImageUrl }]
    } : undefined
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, geistMono.variable)}>
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-primary/30 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
