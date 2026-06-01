/**
 * Supabase Database type definitions.
 *
 * Mirrors the schema defined in supabase/migrations/. Keep this in sync when
 * schema changes. The Database type is consumed by the typed Supabase client
 * (`createClient<Database>(...)`) so that .from('table').select() returns
 * fully-typed rows.
 *
 * Naming convention:
 *   Row    — what a SELECT returns
 *   Insert — what you can pass to .insert()
 *   Update — what you can pass to .update()
 *
 * Columns with defaults (created_at, id, etc.) are optional on Insert.
 */

// =====================================================================
// ENUMS
// =====================================================================

export type VendorStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "churned";

export type CatalogItemType = "service" | "product" | "course";

export type ReviewStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_changes";

export type RedemptionStatus = "pending" | "confirmed" | "disputed" | "voided";

export type AdminRole = "owner" | "admin" | "reviewer" | "support";

export type MemberStatus = "waitlist" | "invited" | "active" | "paused" | "churned";

export type WaitlistRole = "member" | "vendor";

export type WaitlistStatus = "new" | "contacted" | "converted" | "declined";

// =====================================================================
// ROW SHAPES
// =====================================================================

export type WaitlistSignupsRow = {
  id: string;
  role: WaitlistRole;
  email: string;
  full_name: string;
  practice_name: string | null;
  phone: string | null;
  city_state: string | null;
  message: string | null;
  source: string | null;
  utm: Record<string, unknown> | null;
  status: WaitlistStatus;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  contacted_at: string | null;
  notes: string | null;
};

export type VendorApplicationsRow = {
  id: string;
  company_name: string;
  category: string | null;
  website: string | null;
  description: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  secondary_email: string | null;
  secondary_phone: string | null;
  signature_name: string | null;
  signature_title: string | null;
  agreement_version: string | null;
  agreed_to_terms: boolean;
  confirmed_authority: boolean;
  plan_id: string | null;
  source: string | null;
  hotline_email: string | null;
  calendar_link: string | null;
  status: VendorStatus;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  vendor_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorsRow = {
  id: string;
  auth_user_id: string | null;
  company_name: string;
  display_name: string;
  category: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  billing_email: string | null;
  hotline_email: string | null;
  calendar_link: string | null;
  plan_id: string | null;
  months_in_program: number;
  status: VendorStatus;
  verified: boolean;
  agreement_signed_at: string | null;
  agreement_version: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogItemsRow = {
  id: string;
  vendor_id: string;
  type: CatalogItemType;
  name: string;
  tagline: string | null;
  description: string;
  category: string;
  price_label: string;
  duration_hours: number | null;
  module_count: number | null;
  ce_credits: number | null;
  highlights: string[];
  tags: string[];
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  submitted_for_review_at: string | null;
  approved_at: string | null;
  offer_count: number;
  redemptions_lifetime: number;
  created_at: string;
  updated_at: string;
};

export type CatalogMediaRow = {
  id: string;
  catalog_item_id: string;
  kind: "image" | "video" | "document";
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  duration_label: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: string;
};

export type OffersRow = {
  id: string;
  vendor_id: string;
  catalog_item_id: string;
  headline: string;
  discount_value: string;
  promo_code: string | null;
  description: string;
  terms: string;
  valid_from: string;
  valid_to: string;
  redemption_limit_per_member: string;
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  submitted_for_review_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OfferMediaRow = {
  id: string;
  offer_id: string;
  kind: "image" | "video";
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  position: number;
  created_at: string;
};

export type MembersRow = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string | null;
  credential: string | null;
  email: string;
  phone: string | null;
  practice_name: string | null;
  practice_role: string | null;
  city: string | null;
  status: MemberStatus;
  tier: string | null;
  joined_at: string | null;
  activated_at: string | null;
  activated_by: string | null;
  welcome_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ResourceKind =
  | "video_intro"
  | "video_full"
  | "video_explainer"
  | "video_trailer"
  | "audio"
  | "action_guide"
  | "checklist"
  | "key_takeaways"
  | "worksheet"
  | "slide_deck"
  | "email_sequence"
  | "other";

export type ResourcesRow = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  title: string;
  description: string | null;
  kind: ResourceKind;
  storage_path: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_label: string | null;
  position: number;
  is_free: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type MemberResourceProgressRow = {
  member_id: string;
  resource_id: string;
  last_viewed_at: string | null;
  completed_at: string | null;
  watch_seconds: number;
  created_at: string;
  updated_at: string;
};

export type RedemptionsRow = {
  id: string;
  offer_id: string;
  vendor_id: string;
  member_id: string | null;
  member_display: string | null;
  member_city: string | null;
  amount_saved: number | null;
  commission_accrued: number | null;
  status: RedemptionStatus;
  redeemed_on: string;
  notes: string | null;
  created_at: string;
};

export type AdminUsersRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewActionsRow = {
  id: string;
  target_type: "vendor_application" | "catalog_item" | "offer" | "redemption" | "vendor" | "member";
  target_id: string;
  action: string;
  admin_id: string | null;
  note: string | null;
  created_at: string;
};

export type AuthAuditRow = {
  id: string;
  event: string;
  email: string | null;
  user_id: string | null;
  user_type: "vendor" | "member" | "admin" | null;
  ip_hash: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationsRow = {
  id: string;
  audience: "vendor" | "admin";
  vendor_id: string | null;
  admin_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type EmailEventsRow = {
  id: string;
  template: string;
  recipient: string;
  subject: string | null;
  provider: string | null;
  provider_message_id: string | null;
  status: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

// =====================================================================
// INSERT / UPDATE SHAPES
//
// Supabase's typed client expects each table's Insert + Update to be a
// concrete object shape. Using mapped/intersection types here was breaking
// type inference (it'd resolve to `never`). Easiest fix: use Partial<Row>
// for both. We lose compile-time required-field checks but the DB enforces
// them and you get runtime errors — good enough for now.
// =====================================================================

// =====================================================================
// Database type — the shape `createClient<Database>` expects
// =====================================================================

type Table<TRow> = {
  Row: TRow;
  Insert: Partial<TRow>;
  Update: Partial<TRow>;
  Relationships: [];
};

type View<TRow> = {
  Row: TRow;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      waitlist_signups: Table<WaitlistSignupsRow>;
      vendor_applications: Table<VendorApplicationsRow>;
      vendors: Table<VendorsRow>;
      catalog_items: Table<CatalogItemsRow>;
      catalog_media: Table<CatalogMediaRow>;
      offers: Table<OffersRow>;
      offer_media: Table<OfferMediaRow>;
      members: Table<MembersRow>;
      redemptions: Table<RedemptionsRow>;
      admin_users: Table<AdminUsersRow>;
      review_actions: Table<ReviewActionsRow>;
      auth_audit: Table<AuthAuditRow>;
      email_events: Table<EmailEventsRow>;
      notifications: Table<NotificationsRow>;
      resources: Table<ResourcesRow>;
      member_resource_progress: Table<MemberResourceProgressRow>;
    };
    Views: {
      waitlist_counts: View<{
        total: number;
        members: number;
        vendors: number;
        last_24h: number;
      }>;
      waitlist_signups_recent: View<
        Pick<
          WaitlistSignupsRow,
          | "id"
          | "role"
          | "email"
          | "full_name"
          | "practice_name"
          | "phone"
          | "city_state"
          | "message"
          | "source"
          | "status"
          | "created_at"
        >
      >;
    };
    Functions: Record<string, never>;
    Enums: {
      vendor_status: VendorStatus;
      catalog_item_type: CatalogItemType;
      review_status: ReviewStatus;
      redemption_status: RedemptionStatus;
      admin_role: AdminRole;
      member_status: MemberStatus;
      waitlist_role: WaitlistRole;
      waitlist_status: WaitlistStatus;
    };
  };
};

// Convenience aliases for the typed clients
export type TableName = keyof Database["public"]["Tables"];
