/**
 * Score Impact Calculation
 * Based on Critical Decision #3.1 - Score Impact Only (No Business Claims)
 *
 * Calculates the optimization score impact of applying a suggestion
 */

import type { Product } from "@prisma/client";
import { calculateOptimizationScore } from "./calculate-score";
import type { ScoreImpact } from "./types";

/**
 * Calculate the score impact of applying a suggestion to a product
 *
 * @param product - The current product
 * @param suggestedChanges - Object with suggested field changes
 * @returns ScoreImpact showing category, points delta, and level changes
 */
export function calculateScoreImpact(
  product: Product,
  suggestedChanges: Partial<Product>
): ScoreImpact {
  // Calculate current score
  const currentBreakdown = calculateOptimizationScore(product);

  // Create hypothetical product with suggested changes applied
  const hypotheticalProduct = {
    ...product,
    ...suggestedChanges,
  };

  // Calculate new score
  const newBreakdown = calculateOptimizationScore(hypotheticalProduct);

  // Calculate total point delta
  const pointsDelta = newBreakdown.total - currentBreakdown.total;

  // Determine which category was most affected
  const categoryImpacts = {
    coreContent: newBreakdown.coreContent - currentBreakdown.coreContent,
    productIdentity: newBreakdown.productIdentity - currentBreakdown.productIdentity,
    agentFields: newBreakdown.agentFields - currentBreakdown.agentFields,
    mediaQuality: newBreakdown.mediaQuality - currentBreakdown.mediaQuality,
    commerceReadiness: newBreakdown.commerceReadiness - currentBreakdown.commerceReadiness,
    seoQuality: newBreakdown.seoQuality - currentBreakdown.seoQuality,
    reviews: newBreakdown.reviews - currentBreakdown.reviews,
    shipping: newBreakdown.shipping - currentBreakdown.shipping,
  };

  // Find the category with the largest positive impact
  let primaryCategory = "coreContent";
  let maxImpact = 0;

  Object.entries(categoryImpacts).forEach(([category, impact]) => {
    if (impact > maxImpact) {
      maxImpact = impact;
      primaryCategory = category;
    }
  });

  // Generate human-readable description
  const description = generateDescription(
    suggestedChanges,
    pointsDelta,
    currentBreakdown.level,
    newBreakdown.level
  );

  return {
    category: primaryCategory,
    points: pointsDelta,
    currentLevel: currentBreakdown.level,
    newLevel: newBreakdown.level,
    description,
  };
}

/**
 * Generate a human-readable description of the impact
 */
function generateDescription(
  changes: Partial<Product>,
  pointsDelta: number,
  currentLevel: number,
  newLevel: number
): string {
  // Identify the primary change
  const changeDescriptions: string[] = [];

  if (changes.gtin) changeDescriptions.push("Adding GTIN");
  if (changes.mpn) changeDescriptions.push("Adding MPN");
  if (changes.brand) changeDescriptions.push("Adding brand");
  if (changes.productCategory) changeDescriptions.push("Adding category");
  if (changes.title) changeDescriptions.push("Improving title");
  if (changes.description) changeDescriptions.push("Enriching description");
  if (changes.useCases) changeDescriptions.push("Adding use cases");
  if (changes.targetAudience) changeDescriptions.push("Adding target audience");
  if (changes.comparableProducts) changeDescriptions.push("Adding product comparisons");
  if (changes.imageLink) changeDescriptions.push("Adding primary image");
  if (changes.additionalImageLinks) changeDescriptions.push("Adding more images");
  if (changes.videoLink) changeDescriptions.push("Adding video");
  if (changes.weight) changeDescriptions.push("Adding weight");
  if (changes.shipping) changeDescriptions.push("Adding shipping info");

  const changeText = changeDescriptions.length > 0
    ? changeDescriptions.join(", ")
    : "Optimizing product data";

  const sign = pointsDelta >= 0 ? "+" : "";
  const levelChange = currentLevel !== newLevel
    ? ` (Level ${currentLevel} → ${newLevel})`
    : "";

  return `${changeText}: ${sign}${pointsDelta} points${levelChange}`;
}

/**
 * Calculate multiple impacts for a batch of suggestions
 */
export function calculateBatchImpacts(
  product: Product,
  suggestions: Array<{ id: string; changes: Partial<Product> }>
): Array<{ id: string; impact: ScoreImpact }> {
  return suggestions.map((suggestion) => ({
    id: suggestion.id,
    impact: calculateScoreImpact(product, suggestion.changes),
  }));
}

/**
 * Calculate cumulative impact of applying multiple suggestions
 */
export function calculateCumulativeImpact(
  product: Product,
  allChanges: Partial<Product>[]
): ScoreImpact {
  // Merge all changes
  const mergedChanges = allChanges.reduce(
    (acc, changes) => ({ ...acc, ...changes }),
    {}
  );

  return calculateScoreImpact(product, mergedChanges);
}
