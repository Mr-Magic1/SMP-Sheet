import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepTracker MNNIT — DSA Tracker",
  description: "Track 728+ DSA problems from the SMP Skill Prep Doc. Heatmaps, notes, platform stats, and more.",
  keywords: ["DSA", "SMP", "LeetCode", "Codeforces", "CSES", "competitive programming", "practice tracker"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PrepTracker MNNIT",
  },
  openGraph: {
    title: "PrepTracker MNNIT",
    description: "The ultimate DSA tracker built for SMP students.",
    type: "website",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1b2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PrepTracker MNNIT" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <Navbar />
          <CommandPalette />
          <main className="min-h-[calc(100vh-3.5rem)] pb-safe">{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
