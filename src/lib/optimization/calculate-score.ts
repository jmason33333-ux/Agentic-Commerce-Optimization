/**
 * Optimization Score Calculation
 * Based on Critical Decision #1.1 - Weighted Multi-Factor Scoring
 *
 * Two-tier system:
 * 1. Required Fields Check (Pass/Fail) - title, description, price, imageLink, availability, (gtin OR mpn)
 * 2. Optimization Score (100 points → Level 1-10)
 */

import type { Product } from "@prisma/client";
import { SCORE_WEIGHTS, LEVEL_RANGES, REQUIRED_FIELDS, CRITICAL_FIELDS, type ScoreBreakdown } from "./types";

export function calculateOptimizationScore(product: Product): ScoreBreakdown {
  // Initialize breakdown
  const breakdown: ScoreBreakdown = {
    coreContent: 0,
    productIdentity: 0,
    agentFields: 0,
    mediaQuality: 0,
    commerceReadiness: 0,
    seoQuality: 0,
    reviews: 0,
    shipping: 0,
    total: 0,
    level: 0,
    missing: [],
  };

  // 1. CORE CONTENT QUALITY (25 points)
  breakdown.coreContent = calculateCoreContent(product);

  // 2. PRODUCT IDENTITY (20 points)
  breakdown.productIdentity = calculateProductIdentity(product);

  // 3. AGENT-SPECIFIC FIELDS (20 points) 🤖
  breakdown.agentFields = calculateAgentFields(product);

  // 4. MEDIA QUALITY (15 points)
  breakdown.mediaQuality = calculateMediaQuality(product);

  // 5. COMMERCE READINESS (10 points)
  breakdown.commerceReadiness = calculateCommerceReadiness(product);

  // 6. SEO QUALITY (5 points)
  breakdown.seoQuality = calculateSeoQuality(product);

  // 7. REVIEWS & SOCIAL PROOF (3 points)
  breakdown.reviews = calculateReviews(product);

  // 8. SHIPPING & FULFILLMENT (2 points)
  breakdown.shipping = calculateShipping(product);

  // Calculate total
  breakdown.total = Math.min(
    100,
    breakdown.coreContent +
    breakdown.productIdentity +
    breakdown.agentFields +
    breakdown.mediaQuality +
    breakdown.commerceReadiness +
    breakdown.seoQuality +
    breakdown.reviews +
    breakdown.shipping
  );

  // Convert to level (1-10)
  breakdown.level = scoreToLevel(breakdown.total);

  // Identify missing fields
  breakdown.missing = findMissingFields(product);

  return breakdown;
}

// ============================================================================
// CATEGORY SCORING FUNCTIONS
// ============================================================================

/**
 * 1. Core Content Quality (25 points)
 * - Title quality: 0-8 pts (length, descriptiveness)
 * - Description quality: 0-17 pts (length, richness, structure)
 */
function calculateCoreContent(product: Product): number {
  let points = 0;

  // Title quality (0-8 points)
  if (product.title) {
    const titleLength = product.title.length;
    if (titleLength >= 60 && titleLength <= 150) {
      points += 8; // Optimal length
    } else if (titleLength >= 30 && titleLength < 60) {
      points += 5; // Acceptable
    } else if (titleLength >= 15) {
      points += 3; // Minimal
    }
  }

  // Description quality (0-17 points)
  if (product.description) {
    const descLength = product.description.length;
    if (descLength >= 500) {
      points += 10; // Rich description
    } else if (descLength >= 200) {
      points += 6; // Adequate
    } else if (descLength >= 50) {
      points += 3; // Minimal
    }

    // Bonus for structured content (bullets, paragraphs)
    if (descLength >= 100) {
      const hasStructure = /[\n•\-\*]/.test(product.description);
      if (hasStructure) points += 4;

      // Bonus for rich keywords
      const keywordDensity = (product.description.match(/\b\w{5,}\b/g) || []).length;
      if (keywordDensity > 20) points += 3;
    }
  }

  return Math.min(SCORE_WEIGHTS.CORE_CONTENT, points);
}

/**
 * 2. Product Identity (20 points)
 * - GTIN (8pts) OR MPN (6pts)
 * - Brand (7pts, except movies/books)
 * - Product Category (5pts)
 */
function calculateProductIdentity(product: Product): number {
  let points = 0;

  // GTIN or MPN (required for compliance)
  if (product.gtin) {
    points += 8;
  } else if (product.mpn) {
    points += 6;
  }

  // Brand (7 points, not required for movies/books)
  if (product.brand) {
    points += 7;
  }

  // Product Category (5 points)
  if (product.productCategory) {
    const categoryDepth = product.productCategory.split('>').length;
    if (categoryDepth >= 3) {
      points += 5; // Full category path
    } else if (categoryDepth === 2) {
      points += 3; // Partial path
    } else {
      points += 2; // Top level only
    }
  }

  return Math.min(SCORE_WEIGHTS.PRODUCT_IDENTITY, points);
}

/**
 * 3. Agent-Specific Fields (20 points) 🤖
 * - Use Cases & Benefits (7pts)
 * - Target Audience & Context (7pts)
 * - Comparable Products & Differentiators (6pts)
 */
function calculateAgentFields(product: Product): number {
  let points = 0;

  // Use Cases (0-7 points)
  if (product.useCases) {
    const length = product.useCases.length;
    if (length >= 200) {
      points += 7; // Rich use case description
    } else if (length >= 100) {
      points += 5; // Adequate
    } else if (length >= 30) {
      points += 3; // Minimal
    }
  }

  // Target Audience (0-7 points)
  if (product.targetAudience) {
    const length = product.targetAudience.length;
    if (length >= 150) {
      points += 7; // Detailed audience profile
    } else if (length >= 75) {
      points += 5; // Adequate
    } else if (length >= 30) {
      points += 3; // Minimal
    }
  }

  // Comparable Products (0-6 points)
  if (product.comparableProducts) {
    const length = product.comparableProducts.length;
    if (length >= 150) {
      points += 6; // Multiple comparisons
    } else if (length >= 75) {
      points += 4; // Some comparison
    } else if (length >= 30) {
      points += 2; // Minimal
    }
  }

  return Math.min(SCORE_WEIGHTS.AGENT_FIELDS, points);
}

/**
 * 4. Media Quality (15 points)
 * - Primary image (8pts)
 * - Additional images (4pts)
 * - Video (2pts)
 * - 3D model (1pt)
 */
function calculateMediaQuality(product: Product): number {
  let points = 0;

  // Primary image (8 points)
  if (product.imageLink) {
    points += 8;
  }

  // Additional images (0-4 points)
  if (product.additionalImageLinks && Array.isArray(product.additionalImageLinks)) {
    const imageCount = product.additionalImageLinks.length;
    if (imageCount >= 5) {
      points += 4;
    } else if (imageCount >= 3) {
      points += 3;
    } else if (imageCount >= 1) {
      points += 2;
    }
  }

  // Video link (2 points)
  if (product.videoLink) {
    points += 2;
  }

  // 3D model (1 point)
  if (product.model3dLink) {
    points += 1;
  }

  return Math.min(SCORE_WEIGHTS.MEDIA_QUALITY, points);
}

/**
 * 5. Commerce Readiness (10 points)
 * - Price present (5pts)
 * - Inventory > 0 (3pts)
 * - Shipping info (2pts)
 */
function calculateCommerceReadiness(product: Product): number {
  let points = 0;

  // Price (5 points)
  if (product.price && product.price > 0) {
    points += 5;
  }

  // Inventory (3 points)
  if (product.inventoryQuantity > 0) {
    points += 3;
  }

  // Shipping info (2 points)
  if (product.shipping && Array.isArray(product.shipping) && product.shipping.length > 0) {
    points += 2;
  }

  return Math.min(SCORE_WEIGHTS.COMMERCE_READINESS, points);
}

/**
 * 6. SEO Quality (5 points)
 * - Product link (2pts)
 * - Category path (2pts)
 * - Structured dimensions (1pt)
 */
function calculateSeoQuality(product: Product): number {
  let points = 0;

  // Product link (2 points)
  if (product.link) {
    points += 2;
  }

  // Category path (already counted in Product Identity, but check for SEO-friendly format)
  if (product.productCategory && product.productCategory.includes('>')) {
    points += 2;
  }

  // Structured dimensions (1 point)
  const hasDimensions = product.length && product.width && product.height && product.weight;
  if (hasDimensions) {
    points += 1;
  }

  return Math.min(SCORE_WEIGHTS.SEO_QUALITY, points);
}

/**
 * 7. Reviews & Social Proof (3 points)
 * - Product reviews (2pts)
 * - Store reviews (1pt)
 */
function calculateReviews(product: Product): number {
  let points = 0;

  // Product reviews (0-2 points)
  if (product.productReviewCount && product.productReviewCount > 0) {
    if (product.productReviewRating && product.productReviewRating >= 4.0) {
      points += 2; // High-rated reviews
    } else {
      points += 1; // Has reviews
    }
  }

  // Store reviews (1 point)
  if (product.storeReviewCount && product.storeReviewCount > 0) {
    points += 1;
  }

  return Math.min(SCORE_WEIGHTS.REVIEWS, points);
}

/**
 * 8. Shipping & Fulfillment (2 points)
 * - Delivery estimate (1pt)
 * - Return policy (1pt, from workspace)
 */
function calculateShipping(product: Product): number {
  let points = 0;

  // Delivery estimate (1 point)
  if (product.deliveryEstimate) {
    points += 1;
  }

  // Return policy (1 point) - this would come from workspace settings
  // For now, check if shipping data exists as proxy
  if (product.shipping && Array.isArray(product.shipping) && product.shipping.length > 0) {
    points += 1;
  }

  return Math.min(SCORE_WEIGHTS.SHIPPING, points);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert score (0-100) to level (1-10) using approved ranges
 */
function scoreToLevel(score: number): number {
  for (const [min, max, _label] of LEVEL_RANGES) {
    if (score >= min && score <= max) {
      return LEVEL_RANGES.indexOf([min, max, _label]) + 1;
    }
  }
  return 1; // Fallback
}

/**
 * Find missing fields for actionable feedback
 * Returns array of field names that are critical or highly valuable
 */
function findMissingFields(product: Product): string[] {
  const missing: string[] = [];

  // Required fields (Tier 1 compliance)
  if (!product.title) missing.push("title");
  if (!product.description) missing.push("description");
  if (!product.price || product.price <= 0) missing.push("price");
  if (!product.imageLink) missing.push("imageLink");
  if (!product.availability) missing.push("availability");
  if (!product.gtin && !product.mpn) missing.push("gtin or mpn");

  // High-value optional fields
  if (!product.brand) missing.push("brand");
  if (!product.productCategory) missing.push("productCategory");
  if (!product.useCases) missing.push("useCases");
  if (!product.targetAudience) missing.push("targetAudience");
  if (!product.comparableProducts) missing.push("comparableProducts");
  if (!product.additionalImageLinks || (Array.isArray(product.additionalImageLinks) && product.additionalImageLinks.length === 0)) {
    missing.push("additionalImageLinks");
  }
  if (!product.weight) missing.push("weight");

  return missing;
}

/**
 * Determine product status based on score and missing fields
 * - "ready": Level ≥8, no pending suggestions
 * - "pending": Has unapplied suggestions
 * - "missing": Level <5 OR critical fields missing
 */
export function getProductStatus(
  product: Product,
  scoreLevel: number,
  hasPendingSuggestions: boolean
): "ready" | "pending" | "missing" {
  // Check for critical fields
  const criticalMissing = CRITICAL_FIELDS.some((field) => {
    if (field === "title") return !product.title;
    if (field === "price") return !product.price || product.price <= 0;
    if (field === "imageLink") return !product.imageLink;
    if (field === "availability") return !product.availability;
    return false;
  });

  // Missing status: Level <5 OR critical fields missing
  if (scoreLevel < 5 || criticalMissing) {
    return "missing";
  }

  // Pending status: Has unapplied suggestions
  if (hasPendingSuggestions) {
    return "pending";
  }

  // Ready status: Level ≥8
  if (scoreLevel >= 8) {
    return "ready";
  }

  // Default: Fair/Good products without suggestions
  return "pending";
}
