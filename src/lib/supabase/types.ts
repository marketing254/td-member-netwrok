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

export type ExpertApplicationStatus =
  | "new"
  | "reviewing"
  | "invited"
  | "declined"
  | "onboarded";

export type ExpertStatus =
  | "invited"
  | "active"
  | "suspended"
  | "archived";

export type ExpertResourceStatus =
  | "draft"
  | "pending_review"
  | "needs_changes"
  | "approved"
  | "rejected"
  | "archived";

export type ExpertResourceKind =
  | "sop"
  | "template"
  | "slide_deck"
  | "recording"
  | "pdf"
  | "checklist"
  | "worksheet"
  | "other";

export type ExpertPostStatus = "draft" | "published" | "hidden" | "deleted";

export type NetworkAuthorKind = "expert" | "member" | "partner" | "admin";

export type PostReactionKind = "heart" | "insightful" | "helpful" | "agree";

export type ChatbotMessageRole = "member" | "bot" | "expert";

export type ChatbotConversationStatus =
  | "open"
  | "escalated"
  | "expert_handling"
  | "resolved"
  | "abandoned";

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
  sms_consent_at: string | null;
  sms_consent_text: string | null;
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
  sms_consent_at: string | null;
  sms_consent_text: string | null;
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
  sms_consent_at: string | null;
  sms_consent_text: string | null;
  // Added in 0030_profile_avatars.sql.
  avatar_url: string | null;
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
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: string | null;
  subscription_interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  card_brand: string | null;
  card_last4: string | null;
  founding_member_locked: boolean;
  early_member_locked: boolean;
  sms_consent_at: string | null;
  sms_consent_text: string | null;
  // Added in 0030_profile_avatars.sql.
  avatar_url: string | null;
  // Added in 0031_referrals.sql — references referral_codes.id, nullable.
  referral_code_id: string | null;
  created_at: string;
  updated_at: string;
};

export type StripeEventRow = {
  id: string;
  stripe_event_id: string;
  event_type: string;
  member_id: string | null;
  payload: unknown;
  processed_at: string;
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

export type ResourceSubmissionStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected";

export type ResourcesRow = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  category: string | null;
  portal_card_url: string | null;
  resource_card_url: string | null;
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
  submission_status: ResourceSubmissionStatus;
  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  // Added in 0024_resource_inquiries.sql — nullable link back to the
  // expert who authored the underlying material (drives inquiry routing).
  originating_expert_id: string | null;
  // Added in 0025_resource_originating_vendor.sql — same idea for partner
  // (vendor) published resources. Routes inquiries to /vendor/inquiries.
  originating_vendor_id: string | null;
  // Added in 0027_book_club_and_analytics.sql. Distinguishes a standard
  // kit from a Book Club kit (which has its own quotes/chapters payload).
  kit_type: "standard" | "book_club";
  book_club_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

// Added in 0027_book_club_and_analytics.sql. One row per member-view of a
// resource — drives the partner / expert analytics dashboards.
export type ResourceViewsRow = {
  id: string;
  resource_id: string;
  member_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  viewed_at: string;
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

export type MemberAssistantMessageRow = {
  id: string;
  member_id: string;
  role: "user" | "assistant";
  content: string;
  tokens_input: number | null;
  tokens_output: number | null;
  blocked_reason: string | null;
  created_at: string;
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
  // Extend this union whenever a new target gets audited. The DB column is
  // free-form text; the union is a TypeScript-only safety net so callers
  // don't typo a target_type. `expert_application` is used by the expert
  // application + admin add-expert flows in /api/admin/experts.
  target_type:
    | "vendor_application"
    | "catalog_item"
    | "offer"
    | "redemption"
    | "vendor"
    | "member"
    | "expert_application";
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
  user_type: "vendor" | "member" | "admin" | "expert" | null;
  ip_hash: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationsRow = {
  id: string;
  audience: "vendor" | "admin" | "expert" | "member";
  vendor_id: string | null;
  admin_id: string | null;
  recipient_auth_user_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type ExpertApplicationsRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  specialty: string;
  topics: string | null;
  website: string | null;
  booking_link: string | null;
  source: string | null;
  utm: Record<string, unknown> | null;
  status: ExpertApplicationStatus;
  ip_hash: string | null;
  user_agent: string | null;
  agreement_accepted: boolean;
  agreement_accepted_at: string | null;
  sms_consent: boolean;
  sms_consent_text: string | null;
  sms_consent_at: string | null;
  created_at: string;
  contacted_at: string | null;
  notes: string | null;
};

export type ExpertsRow = {
  id: string;
  application_id: string | null;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  display_name: string | null;
  phone: string | null;
  company_name: string | null;
  specialty: string;
  bio: string | null;
  topics: string | null;
  website: string | null;
  booking_link: string | null;
  headshot_url: string | null;
  status: ExpertStatus;
  invited_at: string;
  activated_at: string | null;
  suspended_at: string | null;
  archived_at: string | null;
  invited_by: string | null;
  notes: string | null;
  // Added in 0030_profile_avatars.sql.
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpertResourcesRow = {
  id: string;
  expert_id: string;
  title: string;
  description: string | null;
  kind: ExpertResourceKind;
  storage_bucket: string;
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  branded_storage_path: string | null;
  published_url: string | null;
  status: ExpertResourceStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpertPostsRow = {
  id: string;
  expert_id: string;
  content: string;
  image_url: string | null;
  link_url: string | null;
  status: ExpertPostStatus;
  published_at: string | null;
  hidden_at: string | null;
  hidden_by: string | null;
  hidden_reason: string | null;
  reaction_count: number;
  comment_count: number;
  // Added in 0028_admin_authored_posts.sql. Set when an admin used the
  // /admin/broadcast composer to post on behalf of the expert. Null for
  // self-authored posts.
  composed_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PostReactionsRow = {
  id: string;
  post_id: string;
  author_auth_user_id: string;
  author_kind: NetworkAuthorKind;
  author_display_name: string;
  kind: PostReactionKind;
  created_at: string;
};

export type PostCommentsRow = {
  id: string;
  post_id: string;
  author_auth_user_id: string;
  author_kind: NetworkAuthorKind;
  author_display_name: string;
  author_subtitle: string | null;
  content: string;
  hidden_at: string | null;
  hidden_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatbotConversationsRow = {
  id: string;
  expert_id: string;
  member_auth_user_id: string;
  member_display_name: string;
  status: ChatbotConversationStatus;
  last_message_at: string;
  last_member_message_at: string | null;
  last_bot_message_at: string | null;
  last_expert_message_at: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatbotMessagesRow = {
  id: string;
  conversation_id: string;
  role: ChatbotMessageRole;
  content: string;
  bot_provider: string | null;
  bot_model: string | null;
  bot_latency_ms: number | null;
  bot_token_input: number | null;
  bot_token_output: number | null;
  created_at: string;
};

// Discussion thread under each member-library resource. Schema lives in
// 0024_resource_inquiries.sql.
export type ResourceInquiryStatus = "open" | "answered" | "closed";

export type ResourceInquiriesRow = {
  id: string;
  resource_id: string;
  author_auth_user_id: string;
  author_member_id: string | null;
  author_display_name: string;
  author_subtitle: string | null;
  body: string;
  reply_count: number;
  status: ResourceInquiryStatus;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InquiryReplyKind = "member" | "expert" | "partner" | "admin";

export type ResourceInquiryRepliesRow = {
  id: string;
  inquiry_id: string;
  author_kind: InquiryReplyKind;
  author_auth_user_id: string;
  author_id: string | null;
  author_display_name: string;
  author_subtitle: string | null;
  body: string;
  hidden_at: string | null;
  created_at: string;
};

// Added in 0026_resource_feedback.sql. One row per (member, topic_slug).
export type ResourceFeedbackRow = {
  id: string;
  member_id: string;
  topic_slug: string;
  rating: number;
  comment: string | null;
  progress_pct: number;
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

// Added in 0031_referrals.sql. One row per expert / vendor — exactly
// one of expert_id / vendor_id is set per row.
export type ReferralCodesRow = {
  id: string;
  expert_id: string | null;
  vendor_id: string | null;
  code: string;
  active: boolean;
  created_at: string;
};

// Added in 0031_referrals.sql. One row per (code, member) — converted_at
// stamped by the Stripe webhook when subscription flips to active.
export type ReferralSignupsRow = {
  id: string;
  code_id: string;
  member_id: string;
  converted_at: string | null;
  created_at: string;
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
      member_assistant_messages: Table<MemberAssistantMessageRow>;
      stripe_events: Table<StripeEventRow>;
      expert_applications: Table<ExpertApplicationsRow>;
      experts: Table<ExpertsRow>;
      expert_resources: Table<ExpertResourcesRow>;
      expert_posts: Table<ExpertPostsRow>;
      post_reactions: Table<PostReactionsRow>;
      post_comments: Table<PostCommentsRow>;
      chatbot_conversations: Table<ChatbotConversationsRow>;
      chatbot_messages: Table<ChatbotMessagesRow>;
      resource_inquiries: Table<ResourceInquiriesRow>;
      resource_inquiry_replies: Table<ResourceInquiryRepliesRow>;
      resource_feedback: Table<ResourceFeedbackRow>;
      resource_views: Table<ResourceViewsRow>;
      referral_codes: Table<ReferralCodesRow>;
      referral_signups: Table<ReferralSignupsRow>;
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
      expert_applications_recent: View<
        Pick<
          ExpertApplicationsRow,
          | "id"
          | "email"
          | "full_name"
          | "phone"
          | "company_name"
          | "specialty"
          | "topics"
          | "website"
          | "booking_link"
          | "source"
          | "status"
          | "created_at"
          | "contacted_at"
        >
      >;
      expert_application_counts: View<{
        total: number;
        new_count: number;
        reviewing_count: number;
        invited_count: number;
        onboarded_count: number;
        last_24h: number;
      }>;
      experts_recent: View<
        Pick<
          ExpertsRow,
          | "id"
          | "email"
          | "full_name"
          | "display_name"
          | "specialty"
          | "status"
          | "invited_at"
          | "activated_at"
          | "application_id"
          | "created_at"
        >
      >;
      expert_counts: View<{
        total: number;
        invited: number;
        active: number;
        suspended: number;
        archived: number;
      }>;
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
      expert_application_status: ExpertApplicationStatus;
      expert_status: ExpertStatus;
      expert_resource_status: ExpertResourceStatus;
      expert_resource_kind: ExpertResourceKind;
      expert_post_status: ExpertPostStatus;
      network_author_kind: NetworkAuthorKind;
      post_reaction_kind: PostReactionKind;
      chatbot_message_role: ChatbotMessageRole;
      chatbot_conversation_status: ChatbotConversationStatus;
    };
  };
};

// Convenience aliases for the typed clients
export type TableName = keyof Database["public"]["Tables"];
