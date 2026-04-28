import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Insight — SEO + AEO + GEO Analysis Platform",
  description: "Comprehensive SEO, AEO & GEO analysis platform. Discover keywords, audit your site, analyze competitors, and build winning strategies — no paid APIs required.",
  keywords: ["SEO", "AEO", "GEO", "keyword research", "site audit", "SERP analysis", "backlink strategy", "search engine optimization"],
  authors: [{ name: "SEO Insight" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SEO Insight — SEO + AEO + GEO Analysis Platform",
    description: "Comprehensive SEO, AEO & GEO analysis platform with no paid APIs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Insight",
    description: "SEO + AEO + GEO Analysis Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
