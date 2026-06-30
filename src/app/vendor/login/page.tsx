"use client";

import { Suspense } from "react";
import OtpLoginForm from "@/components/auth/OtpLoginForm";

/**
 * Partner (vendor) sign-in. OTP-based: enter email → receive 6-digit
 * code → enter code → land on /vendor. Application + approval happens
 * at /vendor/signup; the team activates the auth user from there.
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
            "Check your inbox for a 6-digit code from hello@joindmn.com.",
          accentColor: "#6E3346",
          accentTint: "rgba(110,51,70,0.12)",
          signupHref: "/vendor/signup",
          signupLabel: "Want to become a partner?",
          unknownEmailMessage:
            "We couldn't find an application for that email. Apply at /vendor/signup first, then come back to sign in.",
        }}
      />
    </Suspense>
  );
}
