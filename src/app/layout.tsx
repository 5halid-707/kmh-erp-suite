import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KMH ERP Suite | نظام الإدارة المتكامل — كاشير + محاسبة + موارد بشرية + ERP",
  description:
    "نظام إدارة أعمال متكامل يحاكي أضخم الأنظمة العالمية (SAP / Oracle / Odoo) مع أتمتة كاملة للعمليات بين الوحدات. تصميم خالد الحربي.",
  keywords: ["ERP", "Cashier", "Accounting", "HR", "نظام إدارة", "محاسبة", "موارد بشرية"],
  authors: [{ name: "Khalid Al-harbi" }],
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
