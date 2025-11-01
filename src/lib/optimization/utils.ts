/**
 * Optimization Utility Functions
 * Helper functions for product optimization, status mapping, and data transformations
 */

import type { Product } from "@prisma/client";

/**
 * Map issueType to frontend change type category
 * Based on Decision Matrix 3.3
 *
 * @param issueType - The issue type from Suggestion model
 * @returns Change type category for UI display
 */
export function getChangeType(issueType: string): "title" | "field" | "description" {
  if (issueType.includes("title")) return "title";
  if (issueType.includes("description")) return "description";
  return "field"; // default for all other field types
}

/**
 * Map inventory quantity to stock status
 * Based on Decision Matrix 16.1
 *
 * @param quantity - Current inventory quantity
 * @returns Human-readable stock status
 */
export function getStockStatus(quantity: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity === 0) return "Out of Stock";
  if (quantity < 10) return "Low Stock";
  return "In Stock";
}

/**
 * Get optimization level label from score
 *
 * @param level - Optimization level (1-10)
 * @returns Human-readable label
 */
export function getLevelLabel(level: number): string {
  if (level === 10) return "Perfect";
  if (level === 9) return "Excellent";
  if (level === 8) return "Ready";
  if (level === 7) return "Good";
  if (level === 6) return "Fair";
  if (level === 5) return "Needs Work";
  if (level >= 1) return "Poor";
  return "Critical";
}

/**
 * Get optimization level color for UI
 *
 * @param level - Optimization level (1-10)
 * @returns Tailwind color class
 */
export function getLevelColor(level: number): string {
  if (level >= 9) return "text-green-600";
  if (level >= 8) return "text-green-500";
  if (level >= 6) return "text-yellow-500";
  if (level >= 4) return "text-orange-500";
  return "text-red-500";
}

/**
 * Get product status badge variant
 *
 * @param status - Product status (ready/pending/missing)
 * @returns Badge variant for UI
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ready") return "default";
  if (status === "pending") return "secondary";
  if (status === "missing") return "destructive";
  return "outline";
}

/**
 * Format price with currency
 *
 * @param price - Decimal price value
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price));
}

/**
 * Format percentage with sign
 *
 * @param value - Percentage value
 * @returns Formatted percentage string with + or - sign
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get risk level color
 *
 * @param riskLevel - Risk level (LOW/MEDIUM/HIGH)
 * @returns Tailwind color class
 */
export function getRiskColor(riskLevel: string): string {
  if (riskLevel === "LOW") return "text-green-600";
  if (riskLevel === "MEDIUM") return "text-yellow-600";
  if (riskLevel === "HIGH") return "text-red-600";
  return "text-gray-600";
}

/**
 * Calculate completion percentage for optimization
 *
 * @param score - Optimization score (0-100)
 * @returns Percentage (0-100)
 */
export function getCompletionPercentage(score: number): number {
  return Math.min(100, Math.max(0, score));
}

/**
 * Check if product has critical missing fields
 *
 * @param product - Product to check
 * @returns True if critical fields are missing
 */
export function hasCriticalMissing(product: Product): boolean {
  return (
    !product.title ||
    !product.price ||
    product.price <= 0 ||
    !product.imageLink ||
    !product.availability
  );
}

/**
 * Check if product meets baseline compliance
 * Required: title, description, price, imageLink, availability, (gtin OR mpn)
 *
 * @param product - Product to check
 * @returns True if all required fields are present
 */
export function meetsBaselineCompliance(product: Product): boolean {
  return Boolean(
    product.title &&
    product.description &&
    product.price &&
    product.price > 0 &&
    product.imageLink &&
    product.availability &&
    (product.gtin || product.mpn)
  );
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Get time ago string
 *
 * @param date - Date to compare
 * @returns Human-readable time ago string
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Pluralize a word based on count
 *
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string with count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || singular + "s");
  return `${count} ${word}`;
}

/**
 * Get category icon based on scoring category
 *
 * @param category - Scoring category name
 * @returns Icon name for lucide-react
 */
export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    coreContent: "FileText",
    productIdentity: "Tag",
    agentFields: "Bot",
    mediaQuality: "Image",
    commerceReadiness: "ShoppingCart",
    seoQuality: "Search",
    reviews: "Star",
    shipping: "Truck",
  };

  return iconMap[category] || "Circle";
}

/**
 * Get category display name
 *
 * @param category - Scoring category name
 * @returns Human-readable category name
 */
export function getCategoryName(category: string): string {
  const nameMap: Record<string, string> = {
    coreContent: "Core Content",
    productIdentity: "Product Identity",
    agentFields: "Agent Context",
    mediaQuality: "Media Quality",
    commerceReadiness: "Commerce Readiness",
    seoQuality: "SEO Quality",
    reviews: "Reviews & Proof",
    shipping: "Shipping & Fulfillment",
  };

  return nameMap[category] || category;
}
