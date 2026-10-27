// Chairside episodes get their own address in the portal
// (/dashboard/chairside/<slug>) so they never read as a playbook. The
// page itself is the kit detail page, which already switches to the
// episode layout when the kit's type is "chairside".
export { default } from "@/app/dashboard/resources/[slug]/page";
