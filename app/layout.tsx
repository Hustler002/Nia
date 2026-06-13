// app/layout.tsx
// Root layout for the Nia Amazon Now application
// Wraps all pages with NiaProvider for global chat state
// Renders the persistent Nia chat widget (trigger + panel) on every page
// Production: add analytics, auth provider, error boundary

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NiaProvider from "@/components/NiaProvider";
import NiaPanel from "@/components/NiaWidget/NiaPanel";
import NiaTrigger from "@/components/NiaWidget/NiaTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amazon Now — Powered by Nia | Quick Delivery in 10 Minutes",
  description:
    "Tell Nia what you need and get a ready-to-buy cart in seconds. Groceries, essentials, and more delivered in 10 minutes across India.",
  keywords: [
    "Amazon Now",
    "quick commerce",
    "instant delivery",
    "Nia AI",
    "grocery delivery",
    "10 minute delivery",
  ],
  openGraph: {
    title: "Amazon Now — Powered by Nia",
    description: "Full cart. 10 minutes. Done.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#0F1111]">
        <NiaProvider>
          {children}
          {/* Persistent Nia floating widget — visible on all pages */}
          <NiaPanel />
          <NiaTrigger />
        </NiaProvider>
      </body>
    </html>
  );
}
