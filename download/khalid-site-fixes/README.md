# 🔧 حزمة تحسينات موقع خالد الحربي — الأمن السيبراني

تم تجهيز جميع الملفات الجاهزة لإصلاح المشاكل المكتشَفة في التحليل. كل ملف في موقعه الصحيح ضمن بنية مشروع Next.js 16 (App Router).

## 📁 هيكل الملفات

```
khalid-site-fixes/
├── app/
│   ├── sitemap.ts                    ← يولّد /sitemap.xml تلقائيًا
│   ├── robots.ts                     ← يولّد /robots.txt تلقائيًا
│   ├── layout.example.tsx           ← مثال لدمج OG + JSON-LD في layout
│   └── privacy-policy/
│       └── page.tsx                  ← صفحة سياسة الخصوصية (HTML/TSX)
├── components/
│   └── JsonLd.tsx                    ← بيانات منظّمة Schema.org (Person + Service + FAQ + Breadcrumb)
├── public/
│   ├── og.jpg                        ← صورة Open Graph (1200×630) للجودة العالية
│   └── og.png                        ← نسخة PNG شفافة
├── PRIVACY_POLICY.md                 ← نسخة Markdown من السياسة (للمرجع)
└── README.md                         ← هذا الملف
```

## 🚀 خطوات التطبيق (15 دقيقة)

### الخطوة 1: انسخ الملفات إلى مشروعك
```bash
# من داخل مجلد مشروعك الحالي:
cp khalid-site-fixes/app/sitemap.ts         app/sitemap.ts
cp khalid-site-fixes/app/robots.ts          app/robots.ts
cp khalid-site-fixes/components/JsonLd.tsx  components/JsonLd.tsx
cp khalid-site-fixes/app/privacy-policy/page.tsx  app/privacy-policy/page.tsx
cp khalid-site-fixes/public/og.jpg          public/og.jpg
cp khalid-site-fixes/public/og.png          public/og.png
```

### الخطوة 2: حدّث `app/layout.tsx` لدمج JSON-LD + OG tags
افتح ملف `app/layout.tsx` الحالي لديك، وأضف:

```tsx
import JsonLd from "@/components/JsonLd";

// داخل metadata، أضِف:
export const metadata: Metadata = {
  metadataBase: new URL("https://khalid-cyber-security.vercel.app"),
  alternates: {
    canonical: "/",
    languages: { "ar-SA": "/", "en-US": "/en" },
  },
  openGraph: {
    title: "خالد الحربي | خبير أمن سيبراني معتمد",
    description: "خالد محمد الحربي — خبير أمن سيبراني معتمد CPD. خدمات اختبار اختراق، حماية الشبكات، تأمين المواقع، والاستجابة للحوادث الأمنية.",
    url: "https://khalid-cyber-security.vercel.app",
    siteName: "K.Al-harbi Cyber Security",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "خالد الحربي — خبير أمن سيبراني معتمد CPD" }],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "خالد الحربي | خبير أمن سيبراني معتمد",
    description: "خدمات اختبار اختراق، حماية الشبكات، تأمين المواقع، والاستجابة للحوادث الأمنية.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// داخل <body> أضِف المكون:
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body>
        <JsonLd />   {/* ← أضِف هذا السطر */}
        {children}
      </body>
    </html>
  );
}
```

راجع `app/layout.example.tsx` للنسخة الكاملة.

### الخطوة 3: احذف النصّ الغريب من الفوتر 🔴 مهم
ابحث في الكود عن النص:
```
أغاني R&B رايقة موظف .م خالد الحربي
```
واحذفه نهائيًا — يضرّ بمصداقية الموقع.

### الخطوة 4: أضِف رابط سياسة الخصوصية في الفوتر
```tsx
<a href="/privacy-policy" className="text-gray-400 hover:text-cyan-400">
  سياسة الخصوصية
</a>
```

### الخطوة 5: انشر التغييرات
```bash
git add .
git commit -m "feat: add sitemap, robots, JSON-LD, OG image, privacy policy"
git push
# Vercel سينشر التغييرات تلقائيًا
```

### الخطوة 6: اختبر التغييرات
- ✅ افتح `https://khalid-cyber-security.vercel.app/sitemap.xml`
- ✅ افتح `https://khalid-cyber-security.vercel.app/robots.txt`
- ✅ افتح `https://khalid-cyber-security.vercel.app/privacy-policy`
- ✅ اختبر OG: [developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
- ✅ اختبر JSON-LD: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- ✅ اختبر أداء الصفحة: [pagespeed.web.dev](https://pagespeed.web.dev/)

### الخطوة 7: أبلغ Google بالتحديثات
- اذهب إلى [Google Search Console](https://search.google.com/search-console)
- أضِف موقعك (إن لم يكن مضافًا)
- ارفع `sitemap.xml` يدويًا
- اطلب إعادة فهرسة الصفحة الرئيسية

---

## 📋 ملخّص الملفات المُنشأة

| الملف | الوظيفة |
|---|---|
| `app/sitemap.ts` | يولّد خريطة الموقع تلقائيًا لـ Google |
| `app/robots.ts` | يولّد ملف robots.txt مع ربط الـ sitemap |
| `components/JsonLd.tsx` | 4 أنواع بيانات منظّمة: Person, ProfessionalService, FAQ, Breadcrumb |
| `app/layout.example.tsx` | مثال كامل لدمج OG + Twitter + JSON-LD |
| `app/privacy-policy/page.tsx` | صفحة سياسة خصوصية كاملة متوافقة مع PDPL السعودي (14 قسم) |
| `PRIVACY_POLICY.md` | نفس السياسة بصيغة Markdown (للمرجع) |
| `public/og.jpg` | صورة Open Graph 1200×630 بجودة عالية (114KB) |
| `public/og.png` | نسخة PNG بديلة |

---

## ✅ النتائج المتوقعة بعد التطبيق

1. **SEO:** ظهور أفضل في نتائج بحث Google + نتائج غنية (Rich Results) بسبب JSON-LD
2. **التشارك الاجتماعي:** عرض معاينة احترافية عند مشاركة الرابط في WhatsApp / Twitter / LinkedIn
3. **الامتثال القانوني:** موقعك متوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)
4. **الفهرسة:** Google سيكتشف صفحاتك أسرع عبر sitemap.xml
5. **المصداقية:** زوّار الموقع يرون احترافية كاملة (نص غريب محذوف + سياسة خصوصية واضحة)

---

## 🎯 الخطوات التالية الموصى بها (بعد هذا الإصلاح)

1. **شراء نطاق خاص** مثل `khalid-security.com` وتوجيهه إلى Vercel (10 دقائق فقط)
2. **استخدام بريد احترافي** على نطاقك الخاص بدل Zoho المجاني
3. **إضافة مدونة أمنية** بمقالات شهرية (مقال واحد/شهر يرفع SEO كثيرًا)
4. **صحّح روابط أعمالك** على Netlify (مسألة «5halid» بدل «khalid»)
5. **أضِف زر «احجز استشارة»** عبر Calendly
6. **اختبر الموقع على PageSpeed Insights** وحلّ التحذيرات

---

تم إعداد هذه الحزمة بعناية لموقع خالد الحربي — خبير الأمن السيبراني.
© 2026 — K.Al-harbi Cyber Security Services
