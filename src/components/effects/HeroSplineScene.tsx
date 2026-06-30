"use client";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";

/**
 * Embeds a Spline 3D scene as a full-bleed hero backdrop.
 *
 * Spline (https://spline.design) is a 3D scene builder — design once,
 * publish to a hosted URL, embed via iframe. Zero JS work here besides
 * mounting the iframe and waiting for it to finish loading so we can
 * fade it in.
 *
 * Where to get a scene URL:
 *
 *   OPTION A — Use a free community scene:
 *     1. Visit https://spline.design/community
 *     2. Find a scene you like (search "abstract", "premium", "blob")
 *     3. Click "Open in Spline" → "Export" → "Code Export" → "Embed"
 *     4. Copy the URL inside `src="..."` — it'll look like
 *        `https://my.spline.design/<scene-slug>/`
 *     5. Paste it as the `sceneUrl` prop in WaitlistHero.tsx
 *
 *   OPTION B — Build your own scene:
 *     1. Sign in to https://spline.design (free tier exists)
 *     2. Create or import a 3D scene
 *     3. Click the "Export" button → "Public URL" → "Embed"
 *     4. Copy the URL and paste it as `sceneUrl`
 *
 * The component masks the centre band so the headline stays readable —
 * the Spline scene is visible mostly at the top + bottom corners.
 * Hidden under md so small screens skip the iframe entirely.
 */
type Props = {
  /**
   * Spline embed URL — looks like `https://my.spline.design/<scene-slug>/`.
   * If empty or unset, the component renders nothing (graceful fallback).
   */
  sceneUrl?: string;
  /** Overall opacity of the iframe layer. Default 0.85 for visibility. */
  opacity?: number;
};

export default function HeroSplineScene({ sceneUrl, opacity = 0.85 }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);

  // Defer iframe mount by one frame so the page isn't blocked while the
  // Spline runtime downloads (typically 1–3 MB). The hero text is up
  // first; the 3D fades in afterwards.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShouldMount(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!sceneUrl) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        display: { xs: "none", md: "block" },
        opacity: loaded ? opacity : 0,
        transition: "opacity 700ms ease",
        // Soft radial mask — keeps the Spline visible at the top + bottom
        // corners but fades it out behind the centered headline so the
        // text stays crisp. Adjust the inner stop if you want the scene
        // more or less visible behind the text.
        maskImage:
          "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 50%, black 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 50%, black 80%)",
      }}
    >
      {shouldMount && (
        <iframe
          src={sceneUrl}
          title="Hero 3D scene"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          // `allow=...` lets Spline use the WebGL + sensor APIs it needs;
          // sandbox stays open enough for the embed runtime to work.
          allow="autoplay; fullscreen; accelerometer; gyroscope"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            background: "transparent",
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}
