import { Box } from "@mui/material";
import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function AdminSignInPage() {
  return (
    <AuthShell
      variant="admin"
      eyebrow="ADMIN CONSOLE"
      title="Internal access only."
      subtitle="Sign in to triage hotline cases, approve vendor partners, and edit member content. Admin access is invite-only."
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>
        <SignIn
          appearance={clerkAppearance}
          forceRedirectUrl="/admin"
          signUpUrl="/"
        />
      </Box>
    </AuthShell>
  );
}
