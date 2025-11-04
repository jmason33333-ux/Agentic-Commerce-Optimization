# Merchant Setup Guide: ChatGPT Shopping (MVP)

## What This Product Does

**Get your Shopify store live in ChatGPT Shopping in 5 minutes.**

This tool solves the #1 problem merchants face with ChatGPT Shopping: **feed submission and automatic refresh**.

### Without This Tool:
- ❌ Manual XML feed creation (technical nightmare)
- ❌ Manual submission to OpenAI every time products change
- ❌ Products go stale in ChatGPT
- ❌ No idea which products are indexed
- ❌ Complex setup process

### With This Tool:
- ✅ Automatic feed generation from your Shopify catalog
- ✅ One-click submission to OpenAI
- ✅ **Automatic refresh every 15 minutes** (Pro) or Daily (Basic)
- ✅ Per-product control (enable/disable for ChatGPT)
- ✅ Full visibility into what's indexed

---

## Prerequisites

Before you start, you need:

1. **Shopify Store** - Already connected to this tool
2. **OpenAI Commerce Account** - Get from [platform.openai.com/commerce](https://platform.openai.com/commerce)
3. **Products with:**
   - Title
   - Price
   - At least one image
   - GTIN or MPN (product identifiers)

---

## Setup Steps

### Step 1: Get OpenAI Commerce Credentials

1. Go to [platform.openai.com/commerce](https://platform.openai.com/commerce)
2. Sign up or log in with your OpenAI account
3. Create a new merchant profile:
   - Store name
   - Store URL
   - Privacy policy URL
   - Terms of service URL
4. Copy your **Merchant ID** (looks like: `merchant_abc123`)
5. Generate an **API Key** (looks like: `sk-...`)

**Keep these safe** - you'll need them in Step 2.

---

### Step 2: Configure Feed Settings

1. In the app, go to **Feed Dashboard**
2. Click **"Configure OpenAI"**
3. Paste your:
   - Merchant ID
   - API Key
4. Click **"Save Configuration"**

✅ Your store is now connected to OpenAI!

---

### Step 3: Enable Products for ChatGPT

Not all products need to be in ChatGPT Shopping. Choose which ones appear:

1. Go to **Products** page
2. Review your product list
3. For each product, toggle:
   - **🔍 Search** - Product appears in ChatGPT search results
   - **🛒 Checkout** - Product can be purchased via ChatGPT *(Pro feature)*

**Quick Actions:**
- "Enable Search for All" - Make all products searchable
- "Enable Checkout for All" - Enable direct purchase *(Pro only)*

**What to Enable:**
- ✅ Best sellers
- ✅ Products with clear photos
- ✅ Products with GTIN/UPC codes
- ❌ Low-stock items
- ❌ Seasonal products (out of season)

---

### Step 4: Submit Your First Feed

1. Go back to **Feed Dashboard**
2. Review the summary:
   - **245 / 500 products** - How many are ready
   - Warnings (missing GTINs, etc.)
3. Click **"Submit Feed to OpenAI"**
4. Wait 30-60 seconds...
5. ✅ **Success!** Your feed is submitted

**What Happens Next:**
- OpenAI reviews your feed (1-7 days for first submission)
- Products get indexed in ChatGPT
- Your store goes live!

---

### Step 5: Enable Auto-Refresh (Recommended)

Keep your products fresh in ChatGPT:

1. In Feed Dashboard, find **"Auto-Refresh Settings"**
2. Choose frequency:
   - **Manual** - You submit manually (Free)
   - **Daily** - Auto-refresh once per day (Basic)
   - **Every 15 Minutes** - Real-time sync (Pro) 🔥
3. Toggle **"Enable automatic feed refresh"**
4. Click **"Save"**

✅ Your feed now updates automatically!

**Why This Matters:**
- Price changes → Updated in ChatGPT instantly
- New products → Appear in ChatGPT automatically
- Out-of-stock → Removed from search automatically

---

## Understanding Your Dashboard

### Status Indicators

**🟢 Live**
- Your store is indexed in ChatGPT
- Products are appearing in search results
- Everything is working!

**🟡 Syncing**
- Feed is being processed by OpenAI
- Check back in a few minutes
- Normal for first submission (can take 1-7 days)

**🔴 Not Live**
- Feed not submitted or failed
- Check error messages
- Try submitting again

---

### Feed Statistics

**245 / 500 Products Indexed**
- 245 = Products successfully indexed by OpenAI
- 500 = Total products enabled for search

**Last Sync: 2 min ago**
- When your feed was last updated
- If auto-refresh is on, should be recent

---

### Recent Submissions

See your feed submission history:

- **🟢 Indexed** - Successfully processed by OpenAI
- **🟡 Indexing** - Being processed (wait 1-7 days)
- **🔴 Failed** - Submission error (click to see details)

Click any submission to see:
- Which products were included
- Any errors or warnings
- Indexing status

---

## Troubleshooting

### "No products eligible for feed"

**Problem:** All products are disabled for ChatGPT Search.

**Solution:**
1. Go to **Products** page
2. Toggle **🔍 Search** to ON for products you want
3. Try submitting again

---

### "Feed submission failed: Missing GTIN"

**Problem:** OpenAI requires GTIN (barcode) or MPN (part number) for products.

**Solution:**
1. In your **Shopify admin**, add GTINs to products:
   - Go to Products
   - Edit product → Inventory → Barcode
   - Enter UPC, EAN, or ISBN
2. Sync products in this app
3. Try submitting again

**Don't have GTINs?**
- If products are handmade/custom, use MPN (manufacturer part number)
- Use your SKU as MPN if needed
- Contact support for exceptions

---

### "Feed indexing stuck at 0%"

**Problem:** First submissions can take 1-7 days.

**Solution:**
- **Wait 24-48 hours** - OpenAI manually reviews new merchants
- Check your email - OpenAI may request additional info
- Verify your store is public and accessible
- Ensure products have clear images and descriptions

---

### "Checkout toggle is disabled"

**Problem:** Agentic Checkout requires Pro plan and additional setup.

**Solution:**
1. Upgrade to **Pro plan**
2. Go to **Settings → Checkout Configuration**
3. Connect Stripe or Shopify Payments
4. Complete OpenAI checkout verification
5. Checkout toggles will activate

---

## What Products Work Best?

### ✅ Good for ChatGPT Shopping:

- Physical products with clear use cases
- Items with established brands
- Products people search for by name/type
- Items with reviews and ratings
- Products with inventory in stock

### ❌ Not Great for ChatGPT Shopping:

- Digital downloads (not supported yet)
- Gift cards (not supported)
- Services (better for web search)
- Custom/made-to-order (long lead times)
- Products without clear descriptions

---

## Product Optimization Tips

**To improve ChatGPT recommendations:**

1. **Write descriptive titles**
   - ✅ "Men's Leather Wallet - Bifold, RFID Blocking, Brown"
   - ❌ "Wallet"

2. **Include use cases in descriptions**
   - "Perfect for daily commutes and travel"
   - "Ideal for runners training for marathons"

3. **Add target audience details**
   - "Designed for professional photographers"
   - "Great for beginners learning guitar"

4. **Complete product attributes**
   - Brand, color, size, material
   - Weight, dimensions
   - Care instructions

5. **Add high-quality images**
   - Multiple angles
   - Product in use
   - Close-ups of details

---

## Pricing Tiers

### Free
- Manual feed submission
- Up to 100 products
- Community support

### Basic ($49/mo)
- **Daily auto-refresh**
- Up to 500 products
- Email support
- ChatGPT Search enabled

### Pro ($149/mo)
- **15-minute auto-refresh** ⭐
- Unlimited products
- Priority support
- ChatGPT Search + **Checkout** enabled
- Advanced analytics

---

## Next Steps

Once your feed is live:

1. **Monitor performance**
   - Check which products get impressions
   - Track orders from ChatGPT

2. **Optimize products**
   - Improve low-performing listings
   - Add more product details
   - Update pricing strategies

3. **Expand catalog**
   - Enable more products
   - Add new collections
   - Seasonal updates

4. **Upgrade plan** *(optional)*
   - Get real-time sync with Pro
   - Enable ChatGPT Checkout
   - Access advanced features

---

## Getting Help

**Documentation:**
- Setup guides: `/docs`
- API reference: `/docs/api`
- Video tutorials: Coming soon

**Support:**
- Email: support@example.com
- Response time: 24-48 hours (Basic/Pro: 4 hours)
- Live chat: Pro plan only

**Community:**
- Discord server: [link]
- Facebook group: [link]
- YouTube channel: [link]

---

## FAQs

**Q: How long does it take to go live?**
A: First submission: 1-7 days (OpenAI review). After that: instant updates.

**Q: Do I need GTIN for every product?**
A: Yes, or MPN. OpenAI requires unique identifiers for all products.

**Q: Can I sell on ChatGPT without Shopify?**
A: Currently Shopify only. WooCommerce, Etsy coming soon.

**Q: What's the difference between Search and Checkout?**
- **Search**: Products appear in ChatGPT search results
- **Checkout**: Users can buy directly in ChatGPT (requires Pro + Stripe)

**Q: How much does ChatGPT Shopping cost (from OpenAI)?**
A: Free for merchants. OpenAI takes ~15% commission on sales.

**Q: Can I customize what ChatGPT says about my products?**
A: Not directly, but improving descriptions/attributes helps ChatGPT recommend better.

**Q: Will this replace my Shopify store?**
A: No, it's an additional sales channel. Your Shopify store remains primary.

---

## Success Checklist

- [ ] OpenAI Commerce account created
- [ ] Merchant ID and API key configured
- [ ] Products have GTINs/MPNs
- [ ] Products enabled for ChatGPT Search
- [ ] First feed submitted successfully
- [ ] Auto-refresh enabled (Daily or 15-min)
- [ ] Dashboard shows "🟢 Live" status
- [ ] Products appearing in ChatGPT search

✅ **You're live in ChatGPT Shopping!**

---

## What's Next?

**Coming Soon:**
- Product optimization scoring (v2)
- AI-generated descriptions (v2)
- Analytics dashboard (v2)
- Multi-store management (v2)
- WooCommerce connector (v3)
- Etsy integration (v3)

**Stay Updated:**
- Join our mailing list for feature announcements
- Follow us on Twitter: @example
- Join Discord for early access to new features

---

**Questions? Email support@example.com**
