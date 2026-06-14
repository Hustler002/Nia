import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "@/components/providers/ClientLayout";

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
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-white text-[#0F1111]">
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
