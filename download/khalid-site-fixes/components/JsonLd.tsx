// components/JsonLd.tsx — مكون JSON-LD لـ Next.js 16 (App Router)
// ضع هذا الملف داخل مجلد components/ في مشروعك
// ثم استخدمه داخل layout.tsx أو page.tsx الرئيسية
// مثال: import JsonLd from "@/components/JsonLd";  ثم <JsonLd />

import React from "react";

const SITE_URL = "https://khalid-cyber-security.vercel.app";

// ============================================================
// 1) شخص (Person) — يخبر Google أنك شخص حقيقي بخبرة موثّقة
// ============================================================
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "خالد محمد عودة الحربي",
  alternateName: "Khalid Al-harbi",
  jobTitle: "Cyber Security Expert",
  description:
    "خبير أمن سيبراني معتمد CPD من المملكة المتحدة. خدمات اختبار اختراق، حماية الشبكات، تأمين المواقع، والاستجابة للحوادث الأمنية.",
  url: SITE_URL,
  image: `${SITE_URL}/khalid-portrait-opt.jpg`,
  email: "mailto:khalid-alharbi@zohomail.sa",
  telephone: "+966575015019",
  nationality: "Saudi Arabian",
  address: {
    "@type": "PostalAddress",
    addressCountry: "SA",
    addressRegion: "السعودية",
  },
  knowsAbout: [
    "Penetration Testing",
    "Network Security",
    "Cisco Networking",
    "Active Directory Security",
    "Incident Response",
    "Digital Forensics",
    "pfSense Firewall",
    "OWASP Top 10",
    "Kali Linux",
    "Cloud Security (AWS)",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Coventry University",
    sameAs: "https://www.coventry.ac.uk/",
  },
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      name: "CPD Certified (250 hours)",
      credentialCategory: "Professional Development",
      recognizedBy: {
        "@type": "Organization",
        name: "The CPD Certification Service",
        sameAs: "https://cpduk.co.uk",
      },
    },
    {
      "@type": "EducationalOccupationalCredential",
      name: "IBM SkillsBuild Cybersecurity",
      url: "https://www.credly.com/",
    },
    {
      "@type": "EducationalOccupationalCredential",
      name: "Cisco Network Technician",
      url: "https://www.netacad.com/",
    },
    {
      "@type": "EducationalOccupationalCredential",
      name: "OPSWAT Critical Infrastructure Protection",
    },
  ],
  worksFor: {
    "@type": "Organization",
    name: "The Hackers One",
  },
  sameAs: [
    "https://wa.me/966575015019",
    "https://www.credly.com/users/khalid-alharbi",
  ],
};

// ============================================================
// 2) خدمة احترافية (ProfessionalService) — لظهورك في نتائج الخدمات المحلية
// ============================================================
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#service`,
  name: "K.Al-harbi Cyber Security Services",
  alternateName: "خدمات خالد الحربي للأمن السيبراني",
  description:
    "خدمات أمن سيبراني احترافية: اختبار اختراق، حماية الشبكات، تأمين المواقع، الاستجابة للحوادث، الامتثال والتدريب، وتطوير المواقع/التطبيقات.",
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  logo: `${SITE_URL}/designs/logo-2.svg`,
  telephone: "+966575015019",
  email: "khalid-alharbi@zohomail.sa",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "SA",
    addressRegion: "السعودية",
  },
  areaServed: ["SA", "GCC", "Worldwide"],
  provider: { "@id": `${SITE_URL}/#person` },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "خدمات الأمن السيبراني",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "الباقة الأساسية للحماية",
          description: "تقييم أمني شامل وتأمين أساسي للأنظمة والشبكات",
        },
        price: "1500",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "اختبار الاختراق",
          description: "محاكاة هجمات حقيقية لكشف الثغرات وإصلاحها",
        },
        price: "2500",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "الباقة المؤسسية Cisco",
          description: "هندسة شبكات مؤسسية بمعايير Cisco مع عزل DMZ",
        },
        price: "3500",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "تأمين المواقع",
          description: "تحليل وكشف نقاط الضعف في المواقع وحمايتها",
        },
        price: "800",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "الاستجابة للحوادث",
          description: "استجابة فورية، احتواء الاختراق، والتحقيق الجنائي",
        },
        price: "1200",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "الامتثال والتدريب",
          description: "تقييم ISO/PCI-DSS، سياسات أمنية، تدريب الفرق",
        },
        price: "600",
        priceCurrency: "USD",
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "6",
    bestRating: "5",
    worstRating: "1",
  },
};

// ============================================================
// 3) FAQ — أسئلة شائعة (اختياري، يظهر في Google كأسئلة قابلة للطي)
// ============================================================
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هي خدمات الأمن السيبراني التي تقدمها؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أقدم 7 خدمات رئيسية: الباقة الأساسية للحماية، اختبار الاختراق، الباقة المؤسسية Cisco، تأمين المواقع، الاستجابة للحوادث، الامتثال والتدريب، وتطوير موقع/تطبيق شامل.",
      },
    },
    {
      "@type": "Question",
      name: "هل شهاداتك موثّقة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، جميع شهاداتي موثّقة على Credly و CPD UK ويمكن التحقق منها إلكترونيًا بالضغط على أي شهادة في صفحة الشهادات.",
      },
    },
    {
      "@type": "Question",
      name: "كم تستغرق مدة الاستجابة للحوادث؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أرد خلال 24 ساعة كحد أقصى، وفي حالات الطوارئ الأمنية الحرجة أستجيب فورًا عبر واتساب على الرقم +966575015019.",
      },
    },
    {
      "@type": "Question",
      name: "هل تقدم استشارة أمنية مجانية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، أقدم تقييمًا أمنيًا مجانيًا مبدئيًا وعرض سعر مخصص لاحتياجات منشأتك. تواصل عبر النموذج في صفحة الاتصال.",
      },
    },
  ],
};

// ============================================================
// 4) مسار التنقّل (BreadcrumbList) — يحسّن ظهورك في نتائج البحث
// ============================================================
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "خدمات الأمن السيبراني",
      item: `${SITE_URL}/#services`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "تواصل معنا",
      item: `${SITE_URL}/#contact`,
    },
  ],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
