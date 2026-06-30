/**
 * Server-renders JSON-LD into the page HTML. Use this for page-specific
 * structured data (FAQPage, Product, BreadcrumbList, etc.) — the root
 * Organization + WebSite schema is in app/layout.tsx.
 *
 * IMPORTANT: `dangerouslySetInnerHTML` is intentional — JSON-LD must be
 * raw JSON inside a <script> tag, not React children. Don't escape the
 * quotes. The input shape is already constrained to JSON-serialisable
 * objects so there's no XSS surface.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
