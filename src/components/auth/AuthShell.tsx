import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { brand, founding } from "@/lib/content";

const authProof = [
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 20 }} />,
    title: "Fast operator support",
    body: "Members get real answers from humans who understand the business side of a dental practice.",
  },
  {
    icon: <SavingsOutlinedIcon sx={{ fontSize: 20 }} />,
    title: "Savings that compound",
    body: "Vendor partnerships and shared playbooks routinely cover the membership cost many times over.",
  },
  {
    icon: <GroupsOutlinedIcon sx={{ fontSize: 20 }} />,
    title: "A better peer room",
    body: "Built for practice owners who want clarity, accountability, and signal instead of noise.",
  },
];

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #F7F5F0 0%, #F4EFE7 100%)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 40% at 0% 0%, rgba(217,168,75,0.16) 0%, transparent 60%), radial-gradient(40% 38% at 100% 20%, rgba(14,42,61,0.08) 0%, transparent 62%)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", py: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center", minHeight: "calc(100vh - 64px)" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3.5} sx={{ maxWidth: 520 }}>
              <Box
                component="a"
                href="/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.25,
                  textDecoration: "none",
                  color: "text.primary",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #F0C16E 0%, #D9A84B 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "#06182A",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  T
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    textTransform: "none",
                    fontFamily: "var(--font-display)",
                    color: "text.primary",
                    fontSize: "1.1rem",
                  }}
                >
                  {brand.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: "secondary.dark", display: "block", mb: 2 }}>
                  {eyebrow}
                </Typography>
                <Typography variant="h2" component="h1" sx={{ color: "text.primary", maxWidth: 500 }}>
                  {title}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2.5, color: "text.secondary", maxWidth: 480 }}>
                  {subtitle}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(224,218,206,0.9)",
                  backdropFilter: "blur(10px)",
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Typography sx={{ color: "text.primary", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  ${founding.priceMonthly}/month
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Founding rate locked for the first {founding.totalSpots.toLocaleString("en-US")} members.
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {authProof.map((item) => (
                  <Stack
                    key={item.title}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.58)",
                      border: "1px solid rgba(224,218,206,0.82)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        bgcolor: "rgba(14,42,61,0.08)",
                        color: "primary.main",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: "text.primary", fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        {item.body}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", pt: 0.5 }}>
                <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                  Secure authentication powered by Clerk.
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                maxWidth: 500,
                mx: "auto",
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(224,218,206,0.9)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 40px 80px -42px rgba(14,42,61,0.2)",
              }}
            >
              {children}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
