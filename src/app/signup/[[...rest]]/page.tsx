import { Box } from "@mui/material";
import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthShell
      eyebrow="FOUNDING MEMBER ACCESS"
      title="Create your member account."
      subtitle="Reserve your spot, unlock the private workspace, and start with the lowest rate this product will ever have."
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>
        <SignUp appearance={clerkAppearance} />
      </Box>
    </AuthShell>
  );
}
