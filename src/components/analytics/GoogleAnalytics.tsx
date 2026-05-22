import Script from "next/script";

/**
 * Google Analytics 4 loader.
 *
 * Reads the measurement ID from NEXT_PUBLIC_GA_ID. When the env var is
 * missing (local dev, preview builds without it set), the component
 * renders nothing — so analytics never fires unless production has the
 * ID configured.
 *
 * Strategy: `afterInteractive` runs the loader script after the page
 * becomes interactive (doesn't block first paint or hydration). This is
 * the recommended strategy for third-party analytics in Next.js.
 *
 * CSP: next.config.ts allowlists googletagmanager.com (script-src) and
 * google-analytics.com (connect-src + img-src). If you swap GA for
 * something else, update both.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        // The dataLayer + gtag bootstrap. Mirrors the snippet Google
        // hands out, just templated with our measurement ID.
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
