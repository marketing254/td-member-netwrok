"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, Container, IconButton, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { isSupabaseImage } from "@/lib/images";

type KitCard = { slug: string; title: string; card: string; href?: string };

const CARD_W = { xs: 150, md: 206 };
const GAP = 16;
// Shelf drift in px per second. Slow enough to read a card, fast enough
// that the Chairside card comes round in under a minute on a 70-card shelf.
const SPEED = 38;

/**
 * "Just dropped." — the shelf of real kit cards, newest first. The track
 * is a plain horizontal scroller: it drifts right-to-left on its own, the
 * arrows step it one card at a time, and a finger or wheel can drag it.
 * The card list is doubled and the scroll position wraps at the halfway
 * point, so it loops without a visible jump in any direction. Under
 * prefers-reduced-motion the drift stops and the arrows still work.
 */
export default function JustDropped() {
  const [cards, setCards] = useState<KitCard[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Cards whose optimised image failed to load (very large PNGs can time
  // out in the optimiser); they are re-requested as the raw file instead.
  const [rawCards, setRawCards] = useState<Record<string, true>>({});
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Drift pauses while the pointer is over the shelf, while a card has
  // focus, and for a moment after an arrow click so the smooth scroll
  // can finish before the drift takes over again.
  const hold = useRef(false);
  const holdUntil = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/kit-cards");
        if (!active || !res.ok) return;
        const body = (await res.json()) as { cards?: KitCard[] };
        if (active) setCards(body.cards ?? []);
      } catch {
        /* section renders nothing without cards */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loop = cards.length > 3;
  const drift = loop && !reduceMotion;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const half = track.scrollWidth / 2;
      if (half > 0) {
        if (drift && !hold.current && now > holdUntil.current) track.scrollLeft += (SPEED * dt) / 1000;
        // Seamless wrap: the second half of the track is a copy of the first.
        if (track.scrollLeft >= half) track.scrollLeft -= half;
        else if (track.scrollLeft < 0) track.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop, drift, cards.length]);

  if (cards.length === 0) return null;

  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const width = window.innerWidth < 900 ? CARD_W.xs : CARD_W.md;
    holdUntil.current = performance.now() + 900;
    track.scrollBy({ left: dir * (width + GAP), behavior: "smooth" });
  };

  const list = loop ? [...cards, ...cards] : cards;
  const shelf = list.map((c, i) => {
    const copy = loop && i >= cards.length;
    return (
      <Box
        key={`${c.slug}-${i}`}
        aria-hidden={copy ? true : undefined}
        {...(c.href ? { component: "a", href: c.href, "aria-label": `Chairside: ${c.title}`, tabIndex: copy ? -1 : 0 } : {})}
        sx={{
          flex: "none",
          width: CARD_W,
          // Uniform 3:4 frame regardless of the source art. The topic-led
          // portal cards are exactly 3:4 and fill it edge-to-edge; legacy
          // square covers (the book-club kits) sit sharp over a blurred
          // blow-up of their own artwork, so the frame fills with the
          // card's own colors instead of flat letterbox bars.
          position: "relative",
          aspectRatio: "3 / 4",
          borderRadius: "10px",
          overflow: "hidden",
          bgcolor: "#0A1A2F",
          boxShadow: "0 10px 26px -8px rgba(14,42,61,0.35)",
          display: "block",
          textDecoration: "none",
          ...(c.href ? { cursor: "pointer", "&:hover": { boxShadow: "0 16px 32px -10px rgba(14,42,61,0.5)" } } : {}),
        }}
      >
        <Image
          src={c.card}
          alt=""
          aria-hidden
          fill
          unoptimized={!!rawCards[c.slug] || !isSupabaseImage(c.card)}
          sizes="(max-width: 900px) 150px, 206px"
          style={{
            objectFit: "cover",
            filter: "blur(16px) brightness(0.7) saturate(1.15)",
            transform: "scale(1.3)",
          }}
        />
        <Image
          src={c.card}
          alt={copy ? "" : c.title}
          fill
          unoptimized={!!rawCards[c.slug] || !isSupabaseImage(c.card)}
          onError={() => setRawCards((m) => (m[c.slug] ? m : { ...m, [c.slug]: true }))}
          sizes="(max-width: 900px) 150px, 206px"
          style={{ objectFit: "contain" }}
        />
      </Box>
    );
  });

  const arrowSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    width: { xs: 38, md: 44 },
    height: { xs: 38, md: 44 },
    bgcolor: "rgba(255,255,255,0.94)",
    color: "#0A1A2F",
    boxShadow: "0 6px 18px -6px rgba(14,42,61,0.45)",
    border: "1px solid rgba(10,26,47,0.08)",
    "&:hover": { bgcolor: "#FFFFFF" },
    "&:focus-visible": { outline: "2px solid #D9A84B", outlineOffset: 2 },
  } as const;

  return (
    <Box id="library" component="section" sx={{ bgcolor: "#F6F1E7", py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
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
            fontSize: { xs: "1.7rem", md: "2.25rem" },
            color: "#0A1A2F",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            my: 0.75,
          }}
        >
          Just dropped.
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "1rem", lineHeight: 1.6, maxWidth: 640, mx: "auto", mb: 3.5 }}>
          New Practice Playbooks from real expert sessions land every week. Every one is yours
          from day one: action guide, checklist, worksheet, training video, and
          the expert a booking button away.
        </Typography>
      </Container>

      <Box
        sx={{ position: "relative" }}
        onMouseEnter={() => {
          hold.current = true;
        }}
        onMouseLeave={() => {
          hold.current = false;
        }}
        onFocusCapture={() => {
          hold.current = true;
        }}
        onBlurCapture={() => {
          hold.current = false;
        }}
        onTouchStart={() => {
          holdUntil.current = performance.now() + 4000;
        }}
      >
        {loop && (
          <>
            <IconButton aria-label="Previous cards" onClick={() => step(-1)} sx={{ ...arrowSx, left: { xs: 8, md: 20 } }}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton aria-label="Next cards" onClick={() => step(1)} sx={{ ...arrowSx, right: { xs: 8, md: 20 } }}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </>
        )}
        <Box
          ref={trackRef}
          sx={{
            display: "flex",
            gap: `${GAP}px`,
            overflowX: "auto",
            // Side padding only when the shelf doesn't loop; a looping shelf
            // has no start or end, so it runs edge to edge under the fade.
            px: loop ? 0 : { xs: 2, md: 4 },
            py: 1,
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            ...(loop
              ? {
                  maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
                  WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
                }
              : {}),
          }}
        >
          {shelf}
        </Box>
      </Box>
    </Box>
  );
}
