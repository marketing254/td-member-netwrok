"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stats = [
  { value: 500, suffix: "+", label: "Practice owners in the network", note: "Across 42 US states." },
  { value: 6400, prefix: "$", label: "Average member savings (year 1)", note: "Verified in 1:1 reviews." },
  { value: 2, suffix: " hrs", label: "Median hotline first response", note: "Published SLA, measured weekly." },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Member satisfaction (Q1)", note: "Sample n = 312." },
];

export default function Stats() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        bgcolor: "background.default",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {stats.map((s, i) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <Stack spacing={1}>
                <Counter
                  to={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  delay={i * 0.08}
                />
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.95rem" }}>
                  {s.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                  {s.note}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start - delay * 1000) / dur);
      const eased = p < 0 ? 0 : 1 - Math.pow(1 - p, 3);
      setVal(eased * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, delay, reduced]);

  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString("en-US");

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4, delay }}
      style={{ display: "inline-block" }}
    >
      <Typography
        variant="h2"
        component="span"
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "2.75rem", md: "3.5rem" },
          lineHeight: 1,
          color: "primary.main",
          letterSpacing: "-0.02em",
        }}
      >
        {prefix}
        {formatted}
        {suffix}
      </Typography>
    </motion.span>
  );
}
