"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box } from "@mui/material";

/**
 * The RIDA replay player. One Vimeo iframe, driven through Vimeo's
 * postMessage API so no third-party script is loaded on our pages:
 *   { method: "setCurrentTime", value }  seeks
 *   { method: "play" }                   plays
 *   { method: "addEventListener", value: "timeupdate" | "play" } subscribes
 * The player answers with { event, data } messages from https://player.vimeo.com.
 */
export type VimeoPlayerHandle = {
  seekTo: (seconds: number, andPlay?: boolean) => void;
};

type Props = {
  embedSrc: string;
  title: string;
  /** Fires roughly every 250 ms while the video plays. */
  onTime?: (seconds: number) => void;
  /** Fires once, the first time the video starts playing. */
  onFirstPlay?: () => void;
  /** Ratio box. Default 16:9. */
  aspect?: string;
};

const VIMEO_ORIGIN = "https://player.vimeo.com";

const VimeoPlayer = forwardRef<VimeoPlayerHandle, Props>(function VimeoPlayer(
  { embedSrc, title, onTime, onFirstPlay, aspect = "16 / 9" },
  ref,
) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const playedRef = useRef(false);
  const onTimeRef = useRef(onTime);
  const onFirstPlayRef = useRef(onFirstPlay);
  onTimeRef.current = onTime;
  onFirstPlayRef.current = onFirstPlay;

  const post = (message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify(message), VIMEO_ORIGIN);
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== VIMEO_ORIGIN) return;
      let msg: { event?: string; method?: string; data?: { seconds?: number } };
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!msg || typeof msg !== "object") return;
      if (msg.event === "ready") {
        setReady(true);
        post({ method: "addEventListener", value: "timeupdate" });
        post({ method: "addEventListener", value: "play" });
        return;
      }
      if (msg.event === "timeupdate" && typeof msg.data?.seconds === "number") {
        onTimeRef.current?.(msg.data.seconds);
        return;
      }
      if (msg.event === "play" && !playedRef.current) {
        playedRef.current = true;
        onFirstPlayRef.current?.();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useImperativeHandle(ref, () => ({
    seekTo(seconds, andPlay = true) {
      post({ method: "setCurrentTime", value: seconds });
      if (andPlay) post({ method: "play" });
    },
  }));

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        bgcolor: "#06182A",
        borderRadius: { xs: 2, md: 2.5 },
        overflow: "hidden",
        boxShadow: "0 18px 44px rgba(2,10,20,0.35)",
      }}
    >
      <iframe
        ref={frameRef}
        src={embedSrc}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, opacity: ready ? 1 : 0.999 }}
      />
    </Box>
  );
});

export default VimeoPlayer;
