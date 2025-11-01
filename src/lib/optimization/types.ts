/**
 * Optimization Score Types
 * Based on Critical Decision #1.1 - Weighted Multi-Factor Scoring
 */

export interface ScoreBreakdown {
  // Category scores (out of max points)
  coreContent: number;      // max 25
  productIdentity: number;  // max 20
  agentFields: number;      // max 20
  mediaQuality: number;     // max 15
  commerceReadiness: number; // max 10
  seoQuality: number;       // max 5
  reviews: number;          // max 3
  shipping: number;         // max 2

  // Totals
  total: number;            // 0-100
  level: number;            // 1-10

  // Missing fields for actionable feedback
  missing: string[];
}

export interface ScoreImpact {
  category: string;         // Which scoring category affected
  points: number;           // Point delta (e.g., +8)
  currentLevel: number;     // Before suggestion (e.g., 7)
  newLevel: number;         // After suggestion (e.g., 8)
  description: string;      // Human-readable (e.g., "Adding GTIN: +8 points (Level 7 → 8)")
}

export type ProductStatus = "ready" | "pending" | "missing";

export type ProductType = "physical" | "digital" | "service";

// Scoring constants from CD #1.1
export const SCORE_WEIGHTS = {
  CORE_CONTENT: 25,
  PRODUCT_IDENTITY: 20,
  AGENT_FIELDS: 20,
  MEDIA_QUALITY: 15,
  COMMERCE_READINESS: 10,
  SEO_QUALITY: 5,
  REVIEWS: 3,
  SHIPPING: 2,
} as const;

// Level ranges from CD #1.1 (Option C: ranges)
export const LEVEL_RANGES: [number, number, string][] = [
  [90, 100, "Perfect"],
  [80, 89, "Excellent"],
  [70, 79, "Ready"],
  [60, 69, "Good"],
  [50, 59, "Fair"],
  [40, 49, "Needs Work"],
  [30, 39, "Poor"],
  [20, 29, "Poor"],
  [10, 19, "Critical"],
  [0, 9, "Critical"],
];

// Required fields for pass/fail check (Tier 1)
export const REQUIRED_FIELDS = [
  "title",
  "description",
  "price",
  "imageLink",
  "availability",
  // gtin OR mpn (checked in logic)
] as const;

// Critical fields for "missing" status
export const CRITICAL_FIELDS = [
  "title",
  "price",
  "imageLink",
  "availability",
] as const;
