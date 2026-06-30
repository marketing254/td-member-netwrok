import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Providers from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dentalmembernetwork.com"),
  title: {
    default: "Dental Member Network | Expert helpline, partner savings, and the operator playbook",
    template: "%s | Dental Member Network",
  },
  description:
    "The only US dental network with a human expert on the line for every practice problem. 24/7 helpline that returns a written action plan in 2–3 business days, $6,400+ average partner-network savings, and a curated kit library. Founding rate $49/mo, locked for life.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Dental Member Network",
    title: "Dental Member Network — Expert helpline, partner savings, and the operator playbook",
    description:
      "24/7 expert helpline, exclusive partner discounts averaging $6,400/year, and a curated kit library taught by the operators who built it. Founding rate $49/mo, locked for life. First 100 only.",
    images: [
      {
        url: "/td-logo-horizontal-dark.svg",
        width: 540,
        height: 120,
        alt: "Dental Member Network",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Dental Member Network",
    description:
      "Expert helpline, partner savings, and the playbook the top practices actually use.",
    images: ["/td-logo-horizontal-dark.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Verification placeholders — replace with real values from Google
  // Search Console + Bing Webmaster Tools after deploy.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

// Site-wide JSON-LD: Organization + WebSite (with SearchAction). These
// are the two schemas Google + AI assistants consume first; pages can
// layer their own (FAQPage, Product, etc.) on top.
const ORG_AND_WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dentalmembernetwork.com/#organization",
      name: "Dental Member Network",
      alternateName: "DMN",
      url: "https://dentalmembernetwork.com/",
      logo: "https://dentalmembernetwork.com/td-logo-horizontal-dark.svg",
      sameAs: [],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-855-633-4707",
          contactType: "customer support",
          email: "hello@joindmn.com",
          areaServed: "US",
          availableLanguage: "en",
        },
      ],
      description:
        "Membership network for US dental practice owners: 24/7 expert helpline with written action plans, partner-network discounts averaging $6,400/year, and a curated library of operator playbooks.",
    },
    {
      "@type": "WebSite",
      "@id": "https://dentalmembernetwork.com/#website",
      url: "https://dentalmembernetwork.com/",
      name: "Dental Member Network",
      publisher: { "@id": "https://dentalmembernetwork.com/#organization" },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <head>
        {/* Site-wide JSON-LD. Page-specific schema layers on top of this. */}
        <script
          type="application/ld+json"
          // Inline so it's in the static HTML (not JS-injected) and crawlers
          // see it on first byte.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_AND_WEBSITE_JSONLD) }}
        />
      </head>
      <body>
        <Providers>
          <SmoothScroll>{children}</SmoothScroll>
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
