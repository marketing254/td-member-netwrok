import { Box } from "@mui/material";
import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthShell
      eyebrow="MEMBER SIGN IN"
      title="Welcome back to the network."
      subtitle="Access the hotline, savings engine, and member workspace from one secure sign-in."
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>
        <SignIn appearance={clerkAppearance} />
      </Box>
    </AuthShell>
  );
}
