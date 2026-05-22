import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Providers from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
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
    default: "Dental Member Network | Expert helpline, vendor savings, and the operator playbook",
    template: "%s | Dental Member Network",
  },
  description:
    "The only network with a human expert on the line for every practice problem. 24/7 helpline, $6,400+ avg vendor savings, and 500+ practice owners, all in one membership.",
  openGraph: {
    type: "website",
    siteName: "Dental Member Network",
    title: "Dental Member Network, Expert helpline, vendor savings, and the operator playbook",
    description:
      "24/7 expert helpline, exclusive partner discounts, and a directory of 500+ practice owners. Founding rate $49/mo, never increases while active. First 1,000 only.",
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
      "Expert helpline, vendor savings, and a directory of 500+ practice owners.",
    images: ["/td-logo-horizontal-dark.svg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>
        <Providers>
          <SmoothScroll>{children}</SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
