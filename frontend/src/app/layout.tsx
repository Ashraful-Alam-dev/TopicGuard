import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.vercel.app"), // replace with your real domain
  title: {
    default: "TopicGuard — Duplicate Topic Detection",
    template: "%s | TopicGuard",
  },
  description:
    "Register project topics and let TopicGuard catch duplicates before they happen.",
  keywords: ["topic registration", "duplicate detection", "project topics", "classroom management"],
  openGraph: {
    title: "TopicGuard",
    description: "Register project topics and let TopicGuard catch duplicates before they happen.",
    url: "https://your-domain.vercel.app",
    siteName: "TopicGuard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TopicGuard",
    description: "Register project topics and let TopicGuard catch duplicates before they happen.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
