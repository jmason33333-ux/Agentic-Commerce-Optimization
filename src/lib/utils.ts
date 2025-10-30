import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateContentHash(data: {
  title: string;
  description?: string;
  tags?: any;
  price?: any;
  inventory: number;
}): string {
  const content = JSON.stringify({
    title: data.title,
    description: data.description || "",
    tags: data.tags || [],
    price: data.price?.toString() || "",
    inventory: data.inventory,
  });

  return CryptoJS.SHA256(content).toString();
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function calculateSeoScore(issues: any[]): number {
  // Simple scoring: start at 100, deduct points for issues
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === "high") {
      score -= 20;
    } else if (issue.severity === "medium") {
      score -= 10;
    } else {
      score -= 5;
    }
  }

  return Math.max(0, score);
}
