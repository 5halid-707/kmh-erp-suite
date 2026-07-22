// app/layout.tsx — مثال لكيفية دمج JSON-LD في layout الرئيسي
// انسخ فقط الجزء المتعلق بـ JsonLd وضع في ملف layout.tsx الحالي لديك

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  // ... metadata الحالي لديك ...
  metadataBase: new URL("https://khalid-cyber-security.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "ar-SA": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "خالد الحربي | خبير أمن سيبراني معتمد",
    description:
      "خالد محمد الحربي — خبير أمن سيبراني معتمد CPD. خدمات اختبار اختراق، حماية الشبكات، تأمين المواقع، والاستجابة للحوادث الأمنية.",
    url: "https://khalid-cyber-security.vercel.app",
    siteName: "K.Al-harbi Cyber Security",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "خالد الحربي — خبير أمن سيبراني معتمد CPD",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "خالد الحربي | خبير أمن سيبراني معتمد",
    description:
      "خدمات اختبار اختراق، حماية الشبكات، تأمين المواقع، والاستجابة للحوادث الأمنية.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body>
        {/* ضع JsonLd داخل head عبر Next.js metadata API أو هنا مباشرة */}
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
