import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Manrope } from "next/font/google";
import Providers from "@/components/Providers";
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
  metadataBase: new URL("https://join.thrivingdentist.com"),
  title: {
    default: "Thriving Dentist Network | A premium support network for practice owners",
    template: "%s | Thriving Dentist Network",
  },
  description:
    "The operator network for US dental practice owners: real hotline access, measurable vendor savings, and a peer community built for growth.",
  openGraph: {
    type: "website",
    siteName: "Thriving Dentist Network",
    title: "A premium support network for practice owners",
    description:
      "Hotline access, vendor savings, curated playbooks, and a peer community built for owners running real practices.",
    images: [
      {
        url: "/td-logo-horizontal-dark.svg",
        width: 540,
        height: 120,
        alt: "Thriving Dentist Member Network",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Thriving Dentist Network",
    description:
      "Hotline access, vendor savings, and a peer community for practice owners.",
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
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
