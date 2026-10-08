"use client";

import { Suspense } from "react";
import OtpLoginForm from "@/components/auth/OtpLoginForm";
import { PORTAL_TOUR, TOUR_COPY } from "@/lib/portalTour";

/**
 * Expert sign-in. OTP-based: enter email → receive 6-digit code → enter
 * code → land on /expert. Account creation happens via the admin
 * Add-expert flow at /admin/experts, not here.
 */
export default function ExpertLoginPage() {
  return (
    <Suspense fallback={null}>
      <OtpLoginForm
        config={{
          roleLabel: "expert",
          sendEndpoint: "/api/expert/login",
          verifyEndpoint: "/api/expert/verify-otp",
          emailStepTitle: "Sign in to your expert portal",
          codeStepTitle: "Enter your code",
          emailStepSubtitle:
            "We'll email you a 6-digit code. No password to remember.",
          codeStepSubtitle:
            "Check your inbox for a 6-digit code from noreply@dentalmembernetwork.com.",
          accentColor: "#2C7A52",
          accentTint: "rgba(44,122,82,0.12)",
          portalName: "Expert portal",
          panel: { from: "#1F5238", to: "#0C2619", accent: "#9BDDB7", glow: "rgba(155,221,183,0.22)", pattern: "stripes" },
          tagline: "Your profile, your resources and the members who reach out, in one place.",
          highlights: ["Upload resources and we brand and publish them", "See which members engage with your work", "Route member questions straight to you"],
          tourHref: PORTAL_TOUR.expert.quickGuide.watchUrl,
          tourLabel: TOUR_COPY.loginLink,
          unknownEmailMessage:
            "We couldn't find an expert account for that email. Apply at /experts first; we'll email you once the team reviews your application.",
        }}
      />
    </Suspense>
  );
}
