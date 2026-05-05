import { Box } from "@mui/material";
import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function VendorSignInPage() {
  return (
    <AuthShell
      variant="vendor"
      eyebrow="VENDOR PARTNER SIGN IN"
      title="Welcome back, partner."
      subtitle="Manage your offers, track redemptions, and review the agreement that made you a Verified Partner."
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>
        <SignIn
          appearance={clerkAppearance}
          forceRedirectUrl="/vendor"
          signUpUrl="/vendor/signup"
        />
      </Box>
    </AuthShell>
  );
}
