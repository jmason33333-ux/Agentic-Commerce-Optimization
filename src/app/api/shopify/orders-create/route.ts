import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SourceChannel } from "@prisma/client";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  // TODO: verify HMAC here if you have it enabled

  const order = JSON.parse(rawBody);

  // infer workspace from shop domain header
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const workspace = await db.workspace.findFirst({
    where: { shopDomain },
  });

  if (!workspace) {
    return NextResponse.json({ ok: true }); // unknown shop, ignore
  }

  // --- heuristic detection ---
  let isAgentic = false;

  // 1) note attributes
  const noteAttrs = order.note_attributes || [];
  for (const na of noteAttrs) {
    if (
      typeof na.name === "string" &&
      typeof na.value === "string" &&
      (na.value.toLowerCase().includes("chatgpt") ||
        na.value.toLowerCase().includes("ai_checkout") ||
        na.value.toLowerCase().includes("agentic"))
    ) {
      isAgentic = true;
      break;
    }
  }

  // 2) tags
  if (!isAgentic && Array.isArray(order.tags)) {
    const tagsLower = order.tags.map((t: string) => t.toLowerCase());
    if (tagsLower.includes("chatgpt") || tagsLower.includes("agentic")) {
      isAgentic = true;
    }
  } else if (!isAgentic && typeof order.tags === "string") {
    const tagsLower = order.tags.toLowerCase();
    if (tagsLower.includes("chatgpt") || tagsLower.includes("agentic")) {
      isAgentic = true;
    }
  }

  // 3) discount codes
  if (!isAgentic && Array.isArray(order.discount_codes)) {
    for (const dc of order.discount_codes) {
      if (
        typeof dc.code === "string" &&
        ["AICHANNEL", "CHATGPT", "AGENTIC"].includes(dc.code.toUpperCase())
      ) {
        isAgentic = true;
        break;
      }
    }
  }

  const amount = Number(order.total_price || 0);
  const currency = order.currency || "USD";

  // store in our DB regardless, but tag if agentic
  await db.orderEvent.create({
    data: {
      workspaceId: workspace.id,
      orderId: String(order.id),
      amount,
      currency,
      sourceChannel: isAgentic
        ? SourceChannel.CHATGPT_AGENTIC
        : SourceChannel.WEB,
      rawPayload: order,
    },
  });

  return NextResponse.json({ ok: true });
}
