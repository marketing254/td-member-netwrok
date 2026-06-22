"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import Header from "@/components/sections/Header";
import { COLORS } from "@/theme";

type Review = {
  id: number;
  quote: string;
  name: string;
  source: string;
  rating: number;
};

const RESULTS_REVIEWS: Review[] = [
  {
    id: 1,
    quote:
      "Omer and the Ekwa team have helped drive my office greatly in the short time we've worked together. I expressed concerns over my new patient count, calls, and website design — I can proudly say we've hit all-time highs in new patients for my dental office thanks to Ekwa.",
    name: "Loc Tong",
    source: "Google review · Ekwa",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "A fantastic marketing company. Very professional, proactive, and easy to communicate with. They keep close track of our marketing metrics and guide us on how to optimize for better results. I'd absolutely recommend them to anyone looking for a reliable, hands-on marketing team.",
    name: "Paloma O'Donnell",
    source: "Google review · Ekwa",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "My office has used Ekwa for 10-plus years and had great results as well as great customer service. They truly go above and beyond to make sure your office will succeed.",
    name: "Brittney Price",
    source: "Google review · Ekwa",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "An hour's worth of knowledge and advice. I love their whole package offer and personalized approach to each client. Well researched, presented and communicated!",
    name: "Marie-Louise Ratcliffe",
    source: "Google review · Ekwa",
    rating: 5,
  },
];

const TRUST_REVIEWS: Review[] = [
  {
    id: 5,
    quote:
      "Gary and Naren are providing an amazing service — clinical experts and management expertise, shared freely. It has changed the trajectory of my career, quite literally.",
    name: "Verified listener",
    source: "Podcast review",
    rating: 5,
  },
  {
    id: 6,
    quote:
      "Gary and Naren truly care about our profession and are dedicated to providing the kind of information that helps dental practices thrive. Their ideas have helped our team become more focused on our mission.",
    name: "Cathy (front office)",
    source: "Podcast review",
    rating: 5,
  },
  {
    id: 7,
    quote:
      "Invaluable resource for every dentist regardless of the stage you're at in your career.",
    name: "Thomas Jordan",
    source: "Facebook recommendation",
    rating: 5,
  },
  {
    id: 8,
    quote:
      "Gary is a wealth of knowledge in dentistry and just a nice guy. Any staff who get the opportunity to listen to Gary will learn.",
    name: "Travis Frederickson",
    source: "Facebook recommendation",
    rating: 5,
  },
  {
    id: 9,
    quote: "Both Gary and Naren come off as truly genuine people who want to help us succeed.",
    name: "Verified listener",
    source: "Podcast review",
    rating: 5,
  },
  {
    id: 10,
    quote:
      "New to the dental industry, this show has truly helped me learn the ins and outs of running a successful practice.",
    name: "Patterson Dental professional",
    source: "Podcast review",
    rating: 5,
  },
];

const WORKSHOP_REVIEWS: Review[] = [
  {
    id: 11,
    quote:
      "This was one of the best Zoom seminars I've attended since COVID. Well-organized and effective.",
    name: "Workshop attendee",
    source: "Thriving Dentist workshop",
    rating: 5,
  },
  {
    id: 12,
    quote:
      "Gary blows me away every time I hear him speak. This workshop gave me ample tools to take back to the office and begin working on immediately.",
    name: "Workshop attendee",
    source: "Thriving Dentist workshop",
    rating: 5,
  },
  {
    id: 13,
    quote:
      "This course exceeded my expectations in every way. The content and presentation were both excellent.",
    name: "Workshop attendee",
    source: "Thriving Dentist workshop",
    rating: 5,
  },
];

export default function ReviewsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface }}>
      <Header />

      {/* HERO — dark navy. Every text on this background MUST have an explicit
          light color or it inherits the ink color and disappears. */}
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentBright,
              }}
            >
              What dentists say
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "2rem", md: "2.8rem" },
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                color: "#FFFFFF",
              }}
            >
              About the team behind DMN
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "1.02rem", lineHeight: 1.6 }}>
              These are real 5-star reviews of Gary Takacs (Thriving Dentist) and
              Naren Arulrajah (Ekwa Marketing) — the team behind the Dental
              Member Network. We're collecting member testimonials right now;
              you'll see them here after launch.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
              <RatingChip />
              <Chip
                label="Google · Podcast · Facebook · Workshops"
                sx={{
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontWeight: 600,
                  height: 30,
                  "& .MuiChip-label": { color: "#FFFFFF" },
                }}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <ReviewSection
        eyebrow="Results"
        title="What it looks like when it works"
        intro="Ekwa Marketing reviews from active dental practices."
        reviews={RESULTS_REVIEWS}
      />
      <ReviewSection
        eyebrow="Trust & credibility"
        title="Why dentists keep listening"
        intro="Thriving Dentist podcast and community reviews of Gary &amp; Naren."
        reviews={TRUST_REVIEWS}
        muted
      />
      <ReviewSection
        eyebrow="Workshops & training"
        title="On the live workshops"
        intro="Feedback from attendees of recent Thriving Dentist live sessions."
        reviews={WORKSHOP_REVIEWS}
      />

      {/* CTA */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              borderRadius: 3,
              border: `2px solid ${COLORS.accent}`,
              bgcolor: "#FFFFFF",
              p: { xs: 3, md: 5 },
              textAlign: "center",
              boxShadow: "0 24px 60px -30px rgba(217,168,75,0.45)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
                mb: 1,
              }}
            >
              The next chapter
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.6rem", md: "2rem" },
                fontWeight: 500,
                color: COLORS.ink,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              DMN brings all of this under one membership.
            </Typography>
            <Typography sx={{ color: COLORS.muted, mt: 1.5, maxWidth: 540, mx: "auto" }}>
              Founding seats are limited to the first 100 members. Lock the rate for life.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 3, justifyContent: "center" }}
            >
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                href="/pricing"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                See membership pricing
              </Button>
              <Button variant="outlined" color="primary" component={Link} href="/#waitlist">
                Join the waitlist
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function ReviewSection({
  eyebrow,
  title,
  intro,
  reviews,
  muted,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  reviews: Review[];
  muted?: boolean;
}) {
  return (
    <Box sx={{ py: { xs: 6, md: 7 }, bgcolor: muted ? COLORS.surfaceAlt : "transparent" }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: COLORS.accentDeep,
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.6rem", md: "2.1rem" },
              fontWeight: 500,
              color: COLORS.ink,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{ color: COLORS.muted, maxWidth: 620 }}
            dangerouslySetInnerHTML={{ __html: intro }}
          />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxShadow: "0 12px 32px -24px rgba(14,42,61,0.2)",
      }}
    >
      <FormatQuoteRoundedIcon
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 32,
          color: "rgba(217,168,75,0.35)",
        }}
      />
      <Stack direction="row" spacing={0.25}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <StarRoundedIcon key={i} sx={{ fontSize: 18, color: COLORS.accent }} />
        ))}
      </Stack>
      <Typography
        sx={{
          fontSize: "0.94rem",
          color: COLORS.ink,
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        &ldquo;{review.quote}&rdquo;
      </Typography>
      <Box sx={{ mt: "auto", borderTop: `1px solid ${COLORS.line}`, pt: 2 }}>
        <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: COLORS.ink }}>
          {review.name}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.muted, mt: 0.25 }}>
          {review.source}
        </Typography>
      </Box>
    </Box>
  );
}

function RatingChip() {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: 999,
        px: 1.5,
        py: 0.5,
        height: 30,
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarRoundedIcon key={i} sx={{ fontSize: 16, color: COLORS.accentBright }} />
      ))}
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFFFFF", ml: 0.75 }}>
        5.0 average
      </Typography>
    </Box>
  );
}

