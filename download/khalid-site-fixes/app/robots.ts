// app/robots.ts — Next.js 16 App Router
// ضع هذا الملف داخل مجلد app/ في مشروع Next.js الخاص بك
// يولّد تلقائيًا robots.txt على المسار /robots.txt

import type { MetadataRoute } from "next";

const SITE_URL = "https://khalid-cyber-security.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // السماح لمحركات البحث الكبرى بأرشفة كل الصفحات
        userAgent: "*",
        allow: "/",
        // منع أرشفة صفحات الـ API أو الـ Admin إن وُجدت
        disallow: ["/api/", "/admin/"],
      },
    ],
    // ربط ملف sitemap ليتعرّف عليه Google تلقائيًا
    sitemap: `${SITE_URL}/sitemap.xml`,
    // معلومات المضيف (مهم للمواقع الكبيرة)
    host: SITE_URL,
  };
}
