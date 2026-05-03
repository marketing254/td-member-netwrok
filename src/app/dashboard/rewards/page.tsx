"use client";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { member, vendorOffers, rewardCatalog } from "@/lib/memberData";

type TabKey = "discounts" | "points";

export default function RewardsPage() {
  const [tab, setTab] = useState<TabKey>("discounts");
  const [copied, setCopied] = useState<string | null>(null);

  const totalSaved = useMemo(
    () => vendorOffers.reduce((sum, o) => sum + o.savedYtd, 0),
    [],
  );

  const onCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(code);
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          REWARDS · DISCOUNTS · REDEMPTION
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1 }}>
          Where to spend & save
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
          Two currencies, one wallet. Vendor offers stack on every purchase you already make. CE
          points come from the work you put in — redeem them for hotline priority, swag, gift
          cards, and conference seats.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <BigStat
          icon={SavingsOutlinedIcon}
          label="Vendor savings YTD"
          value={`$${totalSaved.toLocaleString()}`}
          footer={`${vendorOffers.filter((v) => v.savedYtd > 0).length} of ${vendorOffers.length} offers in use`}
        />
        <BigStat
          icon={LocalOfferOutlinedIcon}
          label="Active offers"
          value={`${vendorOffers.length}`}
          footer="Negotiated network rates"
        />
        <BigStat
          icon={StarsOutlinedIcon}
          label="CE points balance"
          value={`${member.cePointsBalance}`}
          accent="secondary"
          footer={`${rewardCatalog.filter((r) => r.pointsCost <= member.cePointsBalance).length} of ${rewardCatalog.length} rewards within reach`}
        />
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          <Tab
            value="discounts"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} /> Vendor discounts
              </Stack>
            }
          />
          <Tab
            value="points"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <StarsOutlinedIcon sx={{ fontSize: 18 }} /> CE points store
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {tab === "discounts" && (
        <Grid container spacing={3}>
          {vendorOffers.map((offer) => (
            <Grid key={offer.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "common.white",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, border-color 240ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(14,42,61,0.3)",
                    boxShadow: "0 28px 44px -28px rgba(14,42,61,0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    color: "common.white",
                    backgroundImage: offer.accent,
                    position: "relative",
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.25, gap: 1.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", display: "block", fontWeight: 700 }}>
                        {offer.category}
                      </Typography>
                      <Typography variant="h4" sx={{ color: "common.white", fontSize: "1.4rem", mt: 0.5 }}>
                        {offer.vendor}
                      </Typography>
                    </Box>
                    <Chip
                      label={offer.savedYtd > 0 ? "ACTIVE" : "AVAILABLE"}
                      size="small"
                      sx={{
                        bgcolor: offer.savedYtd > 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.22)",
                        color: offer.savedYtd > 0 ? "primary.dark" : "common.white",
                        fontSize: "0.68rem",
                        height: 24,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        flexShrink: 0,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ color: "common.white", fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1.25, mb: 0.75 }}>
                    {offer.headline}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.92)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {offer.detail}
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
                        Saved YTD
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.4rem",
                          color: offer.savedYtd > 0 ? "success.dark" : "text.secondary",
                          lineHeight: 1.1,
                        }}
                      >
                        {offer.savedYtd > 0 ? `$${offer.savedYtd.toLocaleString()}` : "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: "auto", textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
                        Expires
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {offer.expires}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase", mb: 0.75 }}>
                      Member code
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          flex: 1,
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: "0.92rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          border: "1px dashed",
                          borderColor: "divider",
                          bgcolor: "grey.50",
                          color: "primary.dark",
                        }}
                      >
                        {offer.code}
                      </Box>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => onCopy(offer.code)}
                        startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ flexShrink: 0 }}
                      >
                        {copied === offer.code ? "Copied" : "Copy"}
                      </Button>
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    endIcon={<OpenInNewOutlinedIcon />}
                    href={offer.redeemUrl}
                    sx={{ mt: "auto" }}
                  >
                    Redeem at {offer.vendor}
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === "points" && (
        <Stack spacing={3}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              backgroundImage:
                "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
              color: "common.white",
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
                  "radial-gradient(40% 40% at 80% 0%, rgba(217,168,75,0.4) 0%, transparent 60%)",
              }}
            />
            <Grid container spacing={3} sx={{ position: "relative", alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.25 }}>
                  <StarsOutlinedIcon sx={{ color: "secondary.light", fontSize: 24 }} />
                  <Typography variant="overline" sx={{ color: "secondary.light", fontWeight: 700 }}>
                    YOUR CE POINT BALANCE
                  </Typography>
                </Stack>
                <Typography sx={{ color: "common.white", fontFamily: "var(--font-display)", fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1, mb: 1 }}>
                  {member.cePointsBalance}{" "}
                  <Box component="span" sx={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                    points
                  </Box>
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.92)", maxWidth: 480, lineHeight: 1.55 }}>
                  Earn points for completing courses (10 pts), passing quizzes with 90%+ (25 pts
                  bonus), referring members (50 pts), and attending live AMAs (15 pts).
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    p: 2.75,
                    borderRadius: "16px",
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Typography variant="overline" sx={{ color: "secondary.light", display: "block", mb: 1.25, fontWeight: 700 }}>
                    HOW TO EARN MORE
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      ["Complete a course", "+10 pts"],
                      ["Quiz score ≥ 90%", "+25 pts"],
                      ["Refer a member", "+50 pts"],
                      ["Attend a live AMA", "+15 pts"],
                    ].map(([k, v]) => (
                      <Stack key={k} direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.92)", fontSize: "0.9rem" }}>
                          {k}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "secondary.light", fontWeight: 700, fontSize: "0.9rem" }}>
                          {v}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {rewardCatalog.map((r) => {
              const affordable = member.cePointsBalance >= r.pointsCost;
              return (
                <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "common.white",
                      display: "flex",
                      flexDirection: "column",
                      opacity: affordable ? 1 : 0.78,
                      transition: "transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, border-color 240ms ease",
                      "&:hover": affordable
                        ? {
                            transform: "translateY(-3px)",
                            borderColor: "rgba(14,42,61,0.3)",
                            boxShadow: "0 28px 44px -28px rgba(14,42,61,0.4)",
                          }
                        : {},
                    }}
                  >
                    <Box
                      sx={{
                        height: 108,
                        backgroundImage: r.accent,
                        position: "relative",
                        display: "grid",
                        placeItems: "center",
                        color: "common.white",
                      }}
                    >
                      <RedeemOutlinedIcon sx={{ fontSize: 42, opacity: 0.9 }} />
                      <Chip
                        label={r.category}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          bgcolor: "rgba(255,255,255,0.95)",
                          color: "primary.dark",
                          fontSize: "0.68rem",
                          height: 24,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
                        {r.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", flex: 1 }}>
                        {r.detail}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <StarsOutlinedIcon sx={{ fontSize: 18, color: affordable ? "#A07823" : "text.secondary" }} />
                          <Typography
                            sx={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1.3rem",
                              color: affordable ? "#A07823" : "text.secondary",
                              lineHeight: 1,
                            }}
                          >
                            {r.pointsCost}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                            pts
                          </Typography>
                        </Stack>
                        <Button
                          variant={affordable ? "contained" : "outlined"}
                          color={affordable ? "secondary" : "primary"}
                          size="small"
                          disabled={!affordable}
                        >
                          {affordable ? "Redeem" : `Need ${r.pointsCost - member.cePointsBalance}`}
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  footer,
  accent = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  footer?: string;
  accent?: "primary" | "secondary";
}) {
  const tint =
    accent === "secondary"
      ? { bg: "rgba(217,168,75,0.12)", border: "rgba(217,168,75,0.32)", color: "#A07823" }
      : { bg: "rgba(14,42,61,0.07)", border: "rgba(14,42,61,0.18)", color: "#0E2A3D" };
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box
        sx={{
          p: 3,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          height: "100%",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
          <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: tint.bg,
              border: `1px solid ${tint.border}`,
              display: "grid",
              placeItems: "center",
              color: tint.color,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "2.4rem",
            lineHeight: 1,
            color: "text.primary",
            mb: footer ? 0.75 : 0,
          }}
        >
          {value}
        </Typography>
        {footer && (
          <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
            {footer}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}
