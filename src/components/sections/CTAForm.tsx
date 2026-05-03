"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Reveal from "@/components/Reveal";
import { brand } from "@/lib/content";

const reassurances = [
  "30-day money-back guarantee with no retention call.",
  "We do not store any patient data. Ever.",
  "Founding-member rate locked for the life of the current product.",
  "Cancel anytime, in two clicks, from your account page.",
];

export default function CTAForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Box
      id="apply"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 7, md: 10 },
        bgcolor: "grey.50",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 50% at 0% 50%, rgba(217,168,75,0.12) 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(14,42,61,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 6, md: 8 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Reveal>
              <Box
                className="grain"
                sx={{
                  height: "100%",
                  p: { xs: 3.5, md: 4.5 },
                  borderRadius: 4,
                  backgroundImage: "linear-gradient(180deg, #0A2236 0%, #06182A 100%)",
                  color: "common.white",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 40px 80px -40px rgba(14,42,61,0.6)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "radial-gradient(60% 55% at 100% 0%, rgba(217,168,75,0.2) 0%, transparent 60%)",
                  }}
                />
                <Stack spacing={3} sx={{ position: "relative" }}>
                  <Typography variant="overline" sx={{ color: "secondary.light" }}>
                    FOUNDING CONCIERGE
                  </Typography>
                  <Typography variant="h2" component="h2" sx={{ color: "common.white" }}>
                    Tell us where the practice is stuck.
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.74)" }}>
                    Skip the funnel. Send the real problem and we will tell you, plainly, whether the network is the
                    right fit within one business day.
                  </Typography>
                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                    {reassurances.map((item) => (
                      <Stack key={item} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                        <CheckCircleOutlineIcon sx={{ color: "secondary.light", fontSize: 20, mt: "2px" }} />
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9375rem" }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                      pt: 2.25,
                      mt: 1,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                        Response window
                      </Typography>
                      <Typography sx={{ color: "common.white", fontWeight: 600, mt: 0.5 }}>
                        Under 1 business day
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                      <LockOutlinedIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.48)", fontSize: "0.8125rem" }}>
                        Encrypted in transit. Never shared.
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Reveal>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal delay={0.1}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 40px 80px -42px rgba(14,42,61,0.25)",
                }}
              >
                <CardContent sx={{ p: { xs: 3.5, md: 4.5 } }}>
                  {submitted ? (
                    <Stack spacing={2.5} sx={{ py: 4, alignItems: "center", textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 999,
                          bgcolor: "secondary.main",
                          color: "primary.dark",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 20px 40px -12px rgba(217,168,75,0.5)",
                        }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: 34 }} />
                      </Box>
                      <Typography variant="h4" sx={{ color: "text.primary" }}>
                        Got it. We&apos;ll reply within one business day.
                      </Typography>
                      <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Look for an email from the founding team, not a sales rep.
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={2.5} component="form" onSubmit={onSubmit}>
                      <Stack spacing={0.5} sx={{ mb: 1 }}>
                        <Typography variant="h4" sx={{ color: "text.primary" }}>
                          Send us a private note
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Clear form fields, no floating-label drift, and a real human on the other side.
                        </Typography>
                      </Stack>

                      <Grid container spacing={2.25}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormField
                            label="Full name"
                            name="name"
                            placeholder="Dr. Taylor Morgan"
                            autoComplete="name"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormField
                            label="Work email"
                            name="email"
                            type="email"
                            placeholder="taylor@practice.com"
                            autoComplete="email"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormField
                            label="Practice name"
                            name="practice"
                            placeholder="Morgan Dental Group"
                            autoComplete="organization"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <FormField
                            label="What is the biggest fire in your practice right now?"
                            name="message"
                            placeholder="Give us the short version. Staffing, PPO pressure, expansion, vendors, systems, or anything else that is slowing the practice down."
                            multiline
                            minRows={5}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        size="large"
                        fullWidth
                        disabled={submitting}
                        endIcon={!submitting && <ArrowForwardIcon />}
                      >
                        {submitting ? "Sending..." : "Send to founding team"}
                      </Button>

                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: "0.8rem", textAlign: "center" }}
                      >
                        Or skip the form and{" "}
                        <Box
                          component="a"
                          href={brand.joinUrl}
                          sx={{ color: "primary.main", textDecoration: "underline", fontWeight: 600 }}
                        >
                          claim your founding spot now
                        </Box>
                        .
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

type FormFieldProps = React.ComponentProps<typeof TextField> & {
  label: string;
};

function FormField({ label, name, placeholder, sx, ...props }: FormFieldProps) {
  return (
    <Stack spacing={1}>
      <Typography
        component="label"
        htmlFor={name}
        variant="body2"
        sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.875rem" }}
      >
        {label}
      </Typography>
      <TextField
        {...props}
        id={name}
        name={name}
        placeholder={placeholder}
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            color: "text.primary",
            borderRadius: 3,
            alignItems: props.multiline ? "flex-start" : "center",
            "& fieldset": { borderColor: "divider" },
            "&:hover fieldset": { borderColor: "primary.main" },
            "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 1.5 },
          },
          "& .MuiInputBase-input": {
            py: 1.55,
          },
          "& .MuiInputBase-input::placeholder": {
            color: "text.secondary",
            opacity: 1,
          },
          ...(sx as object),
        }}
      />
    </Stack>
  );
}
