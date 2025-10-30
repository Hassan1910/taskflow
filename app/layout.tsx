import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow - Team Task & Project Manager",
    template: "%s | TaskFlow",
  },
  description: "A modern Trello-style task management application for teams",
  keywords: ["task management", "project management", "team collaboration", "kanban", "productivity"],
  authors: [{ name: "TaskFlow Team" }],
  creator: "TaskFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://taskflow.com",
    title: "TaskFlow - Team Task & Project Manager",
    description: "A modern Trello-style task management application for teams",
    siteName: "TaskFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow - Team Task & Project Manager",
    description: "A modern Trello-style task management application for teams",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
