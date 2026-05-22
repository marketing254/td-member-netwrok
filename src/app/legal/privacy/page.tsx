import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LegalShell, { type LegalSection } from "@/components/sections/LegalShell";

export const metadata = {
  title: "Privacy Policy · Dental Member Network",
  description:
    "What data DMN collects, how it's used, who it's shared with, and your rights. DMN does not collect, store, or process patient data.",
};

const sections: LegalSection[] = [
  {
    number: "01",
    title: "Information We Collect",
    body: "Information you provide:",
    items: [
      "Account registration (name, email, phone).",
      "Practice information (practice name, address, specialty, locations).",
      "Billing information (processed securely via payment processor, we do not store full card numbers).",
      "Profile information (title, years in practice).",
      "Communications (messages, support inquiries).",
      "Information collected automatically, usage data (pages visited, content accessed), device information (browser, OS, IP address), and cookies for session management and analytics.",
      "Information we do NOT collect, patient health information, PHI, clinical records, or any patient data. DMN is a business services platform. HIPAA does not apply to the data we collect.",
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    body: "",
    items: [
      "Provide and improve the DMN platform.",
      "Process payments.",
      "Send membership communications.",
      "Send marketing communications (opt-out available).",
      "Personalize content recommendations.",
      "Analyze usage to improve services.",
      "Respond to support requests.",
      "Comply with legal obligations.",
    ],
  },
  {
    number: "03",
    title: "Information Sharing",
    body: "We do not sell, rent, or trade your personal information. We may share with:",
    items: [
      "Payment processors.",
      "Email service providers.",
      "Analytics providers.",
      "When required by law.",
      "All third-party providers are contractually obligated to protect your information.",
    ],
  },
  {
    number: "04",
    title: "Data Security",
    body: "We implement industry-standard security, including:",
    items: [
      "Encryption in transit (SSL/TLS).",
      "Secure payment processing.",
      "Access controls.",
      "Regular security assessments.",
      "No method is 100% secure, but we treat your data the way we'd want ours treated.",
    ],
  },
  {
    number: "05",
    title: "Your Rights",
    body:
      "You have the right to access, correct, or delete your data. You can opt out of marketing communications at any time. You can request data portability. Contact hello@joindmn.com, we respond within 30 days.",
  },
  {
    number: "06",
    title: "Cookies",
    body:
      "Cookies are used for session management, preferences, analytics, and content recommendations. You can manage cookies via your browser settings.",
  },
  {
    number: "07",
    title: "Children's Privacy",
    body:
      "DMN is not for individuals under 18. We do not knowingly collect information from children.",
  },
  {
    number: "08",
    title: "Changes to This Policy",
    body:
      "We may update this policy. Members are notified of material changes via email before they take effect.",
  },
  {
    number: "09",
    title: "Contact Information",
    body: "",
    items: [
      "Email: hello@joindmn.com",
      "Privacy officer: available on request",
      "Phone: available on request",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <LegalShell
        badge="PRIVACY POLICY"
        title="Privacy Policy"
        tagline="Plain English. No PHI. No data resale."
        intro={
          <>
            DMN respects your privacy and is committed to protecting your personal information.
            This policy explains what we collect, how we use it, and your rights. Critically: we
            do not collect, store, or process any patient data, DMN is a business services
            platform, not a clinical one.
          </>
        }
        effectiveDate="On registration"
        lastUpdated="Active draft"
        keyTerms={[
          { label: "Patient data", value: "Never", sub: "We don't collect PHI" },
          { label: "Resale", value: "Never", sub: "We don't sell data" },
          { label: "Encryption", value: "TLS", sub: "In transit" },
          { label: "Rights", value: "Full", sub: "Access · delete · port" },
          { label: "Response", value: "30 days", sub: "To data requests" },
        ]}
        sections={sections}
        footnote={
          <>
            Questions about your data or a privacy request? Email{" "}
            <a href="mailto:hello@joindmn.com">hello@joindmn.com</a>. We
            respond within 30 days as required by applicable privacy law.
          </>
        }
      />
      <Footer />
    </>
  );
}
