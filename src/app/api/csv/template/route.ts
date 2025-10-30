import { NextRequest, NextResponse } from "next/server";
import { generateOpenAITemplate } from "@/lib/csv/parser";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || "openai";

  let csvContent: string;
  let filename: string;

  if (format === "openai") {
    csvContent = generateOpenAITemplate();
    filename = "openai-product-template.csv";
  } else {
    // Shopify format template
    csvContent = generateShopifyTemplate();
    filename = "shopify-product-template.csv";
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function generateShopifyTemplate(): string {
  const headers = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Option1 Name",
    "Option1 Value",
    "Variant SKU",
    "Variant Grams",
    "Variant Inventory Qty",
    "Variant Price",
    "Variant Barcode",
    "Image Src",
    "Google Shopping / Google Product Category",
    "Google Shopping / Gender",
    "Google Shopping / Condition",
    "Google Shopping / MPN",
  ];

  const exampleRow = [
    "trail-running-shoes",
    "Men's Trail Running Shoes",
    "<p>Waterproof trail shoe with cushioned sole. Ideal for runners and hikers.</p>",
    "Nike",
    "Athletic Shoes",
    "running, trail, outdoor",
    "Color",
    "Black",
    "TRAIL-BLK-10",
    "1200", // grams
    "25",
    "79.99",
    "123456789012",
    "https://example.com/images/shoe1.jpg",
    "Apparel & Accessories > Shoes > Athletic Shoes",
    "unisex",
    "new",
    "TRAIL-BLK-10",
  ];

  return [headers.join(','), exampleRow.map(escapeCSV).join(',')].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
