/**
 * Member Tools registry — mirrors D:\TD - Member Network\Tools\tools_manifest.json
 * (version 2026-07-14, 13 self-contained HTML tools).
 *
 * The HTML files live in `landing/tools-html/` (NOT /public — the dev spec
 * says the full versions must never be publicly reachable). They're served
 * to signed-in members only via GET /api/member/tools/[id].
 *
 * `blurb` is portal-level metadata only (a one-line description for the
 * directory card) — it does NOT change anything inside the tool files.
 */

export type ToolAudience = "owner" | "team";

export type MemberTool = {
  id: string;
  file: string;
  title: string;
  blurb: string;
  category: string;
  audience: ToolAudience;
  /** "expert" = credited to a bench expert; "original" = DMN-built. */
  credit: "expert" | "original";
  expert: string | null;
  kit: string | null;
};

export const MEMBER_TOOLS: MemberTool[] = [
  { id: "ppo-write-off-calculator", file: "ppo_writeoff_calculator.html", title: "PPO Write-Off Calculator", blurb: "See what PPO write-offs really cost, and what dropping a plan would recover.", category: "Insurance & PPOs", audience: "owner", credit: "expert", expert: "Kelly Fox-Galvagni", kit: "The PPO Exit Playbook" },
  { id: "fee-increase-impact", file: "fee_increase_calculator.html", title: "Fee Increase Impact Calculator", blurb: "Model a fee increase and its effect on collections and profit.", category: "Practice Transitions", audience: "owner", credit: "expert", expert: "Dr David Moffet", kit: "Profit Through the Transition" },
  { id: "membership-plan-builder", file: "membership_plan_builder.html", title: "In-House Membership Plan Builder", blurb: "Design an in-house membership plan and price it for profit.", category: "Case Acceptance", audience: "owner", credit: "expert", expert: "Dr. Christopher Phelps", kit: "The Science of Yes" },
  { id: "overhead-benchmark", file: "overhead_benchmark.html", title: "Overhead Benchmark Calculator", blurb: "Benchmark your overhead against the sub-60% target, line by line.", category: "Practice Management", audience: "owner", credit: "expert", expert: "Gary Takacs", kit: "The Overhead Equation: Getting Under 60%" },
  { id: "case-acceptance-gap", file: "case_acceptance_gap.html", title: "Case Acceptance Revenue Gap", blurb: "Quantify the revenue lost to treatment that's diagnosed but not accepted.", category: "Case Acceptance", audience: "owner", credit: "expert", expert: "Gary Takacs", kit: "Case Acceptance Mastery" },
  { id: "new-patient-ltv", file: "new_patient_ltv.html", title: "New Patient Value & Marketing ROI", blurb: "Value a new patient over their lifetime and gauge your marketing ROI.", category: "Marketing & SEO", audience: "owner", credit: "expert", expert: "Naren Arulrajah", kit: "5 Marketing Mistakes Costing You New Patients" },
  { id: "open-chair-cost", file: "open_chair_cost.html", title: "Open Chair Cost Calculator", blurb: "Put a dollar figure on every open hour in the schedule.", category: "Practice Management", audience: "owner", credit: "expert", expert: "Gary Takacs", kit: "Scheduling for Profitability" },
  { id: "equipment-roi", file: "equipment_roi.html", title: "Equipment ROI Calculator", blurb: "Check the payback period and ROI on a new equipment purchase.", category: "Practice Management", audience: "owner", credit: "original", expert: null, kit: null },
  { id: "break-even-day", file: "breakeven_day.html", title: "Break-Even Day Calculator", blurb: "Find the day each month your practice starts turning a profit.", category: "Practice Management", audience: "owner", credit: "original", expert: null, kit: null },
  { id: "patient-reactivation-value", file: "patient_reactivation.html", title: "Patient Reactivation Value Calculator", blurb: "Estimate the revenue sitting in your inactive-patient list.", category: "Patient Experience", audience: "owner", credit: "original", expert: null, kit: null },
  { id: "practice-loan-calculator", file: "practice_loan_calculator.html", title: "Practice Loan Calculator", blurb: "Estimate payments and total cost on a practice-acquisition loan.", category: "Practice Transitions", audience: "owner", credit: "original", expert: null, kit: "How to Buy a Dental Practice" },
  { id: "tooth-numbering-converter", file: "tooth_numbering_converter.html", title: "Tooth Numbering Converter", blurb: "Convert instantly between Universal, FDI, and Palmer notation.", category: "Chairside Reference", audience: "team", credit: "original", expert: null, kit: null },
  { id: "patient-portion-estimator", file: "patient_portion_estimator.html", title: "Patient Portion Estimator", blurb: "Estimate a patient's out-of-pocket portion before treatment.", category: "Front Desk", audience: "team", credit: "original", expert: null, kit: null },
];

/** Category display order + accent colors (matches the kit registry). */
export const TOOL_CATEGORIES: { name: string; color: string }[] = [
  { name: "Practice Management", color: "#1B3A5C" },
  { name: "Practice Transitions", color: "#A0522D" },
  { name: "Case Acceptance", color: "#0E7490" },
  { name: "Marketing & SEO", color: "#B45309" },
  { name: "Patient Experience", color: "#6D28D9" },
  { name: "Insurance & PPOs", color: "#1F5C40" },
  { name: "Front Desk", color: "#0F766E" },
  { name: "Chairside Reference", color: "#3B4A55" },
];

export function toolById(id: string): MemberTool | undefined {
  return MEMBER_TOOLS.find((t) => t.id === id);
}
