import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "Antigravity | Premium Mobile Accessories",
  description: "Precision-engineered gear for your devices.",
};

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
