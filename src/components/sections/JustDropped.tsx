"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Button, Container, Skeleton, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { isSupabaseImage } from "@/lib/images";

type KitCard = {
  slug: string;
  title: string;
  card: string;
  category: string | null;
  expert: string | null;
  href?: string;
};

const SHELF_SIZE = 6;

/**
 * "Just dropped." — the six newest kits as a plain, fixed grid, with the
 * library count beside the heading. Replaces the looping marquee, which
 * loaded every card twice and timed out the image optimiser: this renders
 * exactly six images, lazily, sized for the slot they sit in.
 */
export default function JustDropped() {
  const [cards, setCards] = useState<KitCard[] | null>(null);
  const [total, setTotal] = useState(0);
  // Cards whose optimised image failed to load (very large PNGs can time
  // out in the optimiser); they are re-requested as the raw file instead.
  const [rawCards, setRawCards] = useState<Record<string, true>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/kit-cards");
        if (!active || !res.ok) {
          if (active) setCards([]);
          return;
        }
        const body = (await res.json()) as { cards?: KitCard[]; total?: number };
        if (!active) return;
        setCards((body.cards ?? []).slice(0, SHELF_SIZE));
        setTotal(body.total ?? 0);
      } catch {
        if (active) setCards([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (cards && cards.length === 0) return null;

  return (
    <Box id="library" component="section" sx={{ bgcolor: "#F6F1E7", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Heading row: copy on the left, the library count on the right */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
            alignItems: "end",
            columnGap: 4,
            rowGap: 2.5,
            mb: { xs: 3.5, md: 4.5 },
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#A07823",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              The library
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.8rem", md: "2.4rem" },
                color: "#0A1A2F",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                my: 0.75,
              }}
            >
              Just dropped.
            </Typography>
            <Typography sx={{ color: "#5C6770", fontSize: "1rem", lineHeight: 1.6, maxWidth: 560 }}>
              New Practice Playbooks from real expert sessions land every week. Every one is yours
              from day one: action guide, checklist, worksheet, training video, and the expert a
              booking button away.
            </Typography>
          </Box>

          {/* Count card: the one number the shelf used to imply by scrolling forever */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2.5,
              py: 1.75,
              borderRadius: "12px",
              bgcolor: "#0A1A2F",
              color: "#FFFFFF",
              boxShadow: "0 14px 32px -16px rgba(10,26,47,0.5)",
              justifySelf: { xs: "start", md: "end" },
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "2rem", md: "2.4rem" },
                lineHeight: 1,
                color: "#F0C16E",
                fontWeight: 500,
                minWidth: 56,
              }}
            >
              {cards ? total : <Skeleton width={56} sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />}
            </Typography>
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.2, color: "#FFFFFF" }}>
                Practice Playbooks
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.3 }}>
                in the member library today
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* The grid: 2 across on phones, 3 on tablets, all 6 on desktop */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: `repeat(${SHELF_SIZE}, minmax(0, 1fr))` },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {(cards ?? Array.from({ length: SHELF_SIZE }, () => null)).map((c, i) => {
            if (!c) {
              return (
                <Box key={`s-${i}`}>
                  <Skeleton variant="rounded" sx={{ aspectRatio: "3 / 4", height: "auto", width: "100%", borderRadius: "10px", bgcolor: "rgba(10,26,47,0.08)" }} />
                  <Skeleton width="60%" sx={{ mt: 1.25 }} />
                  <Skeleton width="85%" />
                </Box>
              );
            }
            const unoptimized = !!rawCards[c.slug] || !isSupabaseImage(c.card);
            const isNew = i === 0;
            return (
              <Box
                key={c.slug}
                component={c.href ? "a" : "div"}
                href={c.href}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  minWidth: 0,
                  "&:hover .card-art": { transform: "translateY(-3px)", boxShadow: "0 18px 34px -14px rgba(10,26,47,0.5)" },
                  "&:focus-visible": { outline: "2px solid #D9A84B", outlineOffset: 4, borderRadius: "12px" },
                }}
              >
                <Box
                  className="card-art"
                  sx={{
                    position: "relative",
                    aspectRatio: "3 / 4",
                    borderRadius: "10px",
                    overflow: "hidden",
                    bgcolor: "#0A1A2F",
                    boxShadow: "0 10px 26px -10px rgba(10,26,47,0.4)",
                    transition: "transform 200ms ease, box-shadow 200ms ease",
                  }}
                >
                  <Image
                    src={c.card}
                    alt={c.title}
                    fill
                    loading="lazy"
                    unoptimized={unoptimized}
                    onError={() => setRawCards((m) => (m[c.slug] ? m : { ...m, [c.slug]: true }))}
                    sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 190px"
                    style={{ objectFit: "cover" }}
                  />
                  {isNew && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        bgcolor: "#D9A84B",
                        color: "#0A1A2F",
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      New this week
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    mt: 1.25,
                    color: "#A07823",
                    fontSize: "0.66rem",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.category ?? "Practice Playbook"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    lineHeight: 1.25,
                    color: "#0A1A2F",
                    mt: 0.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.title}
                </Typography>
                {c.expert && (
                  <Typography sx={{ fontSize: "0.78rem", color: "#5C6770", mt: 0.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.expert}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Footer line: the rest of the library sits behind the join button */}
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            pt: 3,
            borderTop: "1px solid #E3DAC8",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography sx={{ color: "#5C6770", fontSize: "0.95rem" }}>
            {cards && total > cards.length
              ? `Plus ${total - cards.length} more inside, with the expert behind each one a booking button away.`
              : "Every Playbook comes with the expert behind it a booking button away."}
          </Typography>
          <Button
            component="a"
            href="/join/member"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 999,
              px: 2.75,
              bgcolor: "#0A1A2F",
              color: "#FFFFFF",
              boxShadow: "none",
              "&:hover": { bgcolor: "#14334A", boxShadow: "none" },
            }}
          >
            Open the library
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
