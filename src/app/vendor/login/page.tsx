"use client";

import { Suspense } from "react";
import OtpLoginForm from "@/components/auth/OtpLoginForm";
import { PORTAL_TOUR, TOUR_COPY } from "@/lib/portalTour";

/**
 * Partner (vendor) sign-in. OTP-based: enter email → receive 6-digit
 * code → enter code → land on /vendor. Application happens at
 * /partners#apply (in-page WaitlistSection); the team reviews and an
 * admin activates the auth user from the admin portal.
 */
export default function VendorLoginPage() {
  return (
    <Suspense fallback={null}>
      <OtpLoginForm
        config={{
          roleLabel: "partner",
          sendEndpoint: "/api/vendor/login",
          verifyEndpoint: "/api/vendor/verify-otp",
          emailStepTitle: "Sign in to your partner portal",
          codeStepTitle: "Enter your code",
          emailStepSubtitle:
            "We'll email you a 6-digit code. No password to remember.",
          codeStepSubtitle:
            "Check your inbox for a 6-digit code from noreply@dentalmembernetwork.com.",
          accentColor: "#6E3346",
          accentTint: "rgba(110,51,70,0.12)",
          portalName: "Partner portal",
          panel: { from: "#5A2238", to: "#2A0F1A", accent: "#F0C16E", glow: "rgba(240,193,110,0.22)", pattern: "grid" },
          tagline: "Your listing, your member offers and the practices that find you.",
          highlights: ["Publish services, products and courses", "Attach member-only offers to each one", "Member inquiries routed to your inbox"],
          tourHref: PORTAL_TOUR.partner.quickGuide.watchUrl,
          tourLabel: TOUR_COPY.loginLink,
          signupHref: "/partners#apply",
          signupLabel: "Want to become a partner?",
          unknownEmailMessage:
            "We couldn't find an application for that email. Apply at /partners first, then come back to sign in.",
        }}
      />
    </Suspense>
  );
}
