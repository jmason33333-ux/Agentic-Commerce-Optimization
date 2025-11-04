# v0 Prompt: Agentic Checkout Setup Wizard

## Design System (Same as Feed Dashboard)

**Colors:** Purple primary (#8b5cf6), Amber accent (#f59e0b), Emerald success (#10b981), Slate dark theme
**Font:** Inter
**Component Library:** shadcn/ui

---

## Overview

The checkout setup is the MOST complex part of ChatGPT Shopping. This wizard makes it feel simple and premium.

**Flow:**
1. Stripe Connection → 2. Checkout URLs → 3. OpenAI Registration → 4. Test & Verify → 5. Orders Dashboard

---

## Component 1: Checkout Setup Wizard (Main Page)

**File:** `src/app/dashboard/[workspaceId]/checkout/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ChatGPT Checkout Setup                                          │
│  Enable direct purchases from ChatGPT                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Progress: Step 2 of 4                                           │
│  ●━━━━━●━━━━━○━━━━━○                                            │
│  Stripe  URLs  Register Test                                     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  [CURRENT STEP COMPONENT RENDERS HERE]                      │ │
│  │                                                              │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [< Back]                                    [Continue >]         │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Design Requirements

**1. Progress Indicator**
- Horizontal step indicator with 4 steps
- Completed steps: filled purple circles (●)
- Current step: purple circle with pulse animation
- Pending steps: gray outlined circles (○)
- Lines connecting steps (purple for completed, gray for pending)
- Step labels below circles

**2. Step Container**
- Large card (bg-slate-800)
- Padding: p-8
- Rounded corners: rounded-xl
- Each step is a separate component that renders in this container

**3. Navigation Buttons**
- "Back" button: ghost/secondary style (left)
- "Continue" button: purple primary (right)
- "Skip" button: text link (for optional steps)
- Buttons disabled during loading

---

## Component 2: Step 1 - Stripe Connection

**Component:** `src/components/checkout/steps/StripeConnection.tsx`

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Connect Stripe                                             │
│  We use Stripe to process ChatGPT checkout payments        │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  🔑 Get your Stripe API keys from the Stripe Dashboard     │
│                                                              │
│  Publishable Key                                            │
│  [pk_test_______________________________________]            │
│  ⓘ Starts with pk_test_ or pk_live_                        │
│                                                              │
│  Secret Key                                                 │
│  [sk_test_______________________________________] [Show]    │
│  ⓘ Starts with sk_test_ or sk_live_                        │
│                                                              │
│  Webhook Secret (Optional)                                  │
│  [whsec_________________________________________] [Show]    │
│  ⓘ Get from Stripe Dashboard → Webhooks                    │
│                                                              │
│  ☑ I'm using test keys (Development mode)                  │
│                                                              │
│  [Validate & Continue]                                      │
│                                                              │
│  ℹ️  Don't have Stripe? [Create free account →]            │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Design Requirements

**Input Fields:**
- Three input fields with show/hide password toggle
- Helper text below each field (italic, slate-400)
- Input validation:
  - Publishable key must start with `pk_`
  - Secret key must start with `sk_`
  - Both must be test OR both live (validate before continue)

**Test Mode Checkbox:**
- Checkbox with label
- Orange badge "Test Mode" appears when checked
- Info: "Orders won't be charged real money"

**Validation Button:**
- "Validate & Continue" button
- Loading state: "Validating..." with spinner
- Success: Green checkmark + "Valid!" (2 seconds) then auto-continue
- Error: Red X + error message below button

**Helper Card:**
- Info alert at bottom (blue, subtle)
- Link to Stripe signup
- Link to "Where to find API keys" guide

**States:**
```typescript
interface StripeConnectionState {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  isTestMode: boolean;
  isValidating: boolean;
  validationError?: string;
}
```

---

## Component 3: Step 2 - Checkout URLs

**Component:** `src/components/checkout/steps/CheckoutUrls.tsx`

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Configure Checkout URLs                                    │
│  Tell OpenAI where to send customers                        │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Checkout Endpoint URL                                      │
│  [https://your-domain.com/api/checkout/abc123__]            │
│  ⓘ This is your unique checkout endpoint                   │
│  📋 Copy URL                                                │
│                                                              │
│  ✅ Automatically generated for you!                        │
│                                                              │
│  Webhook URL (Optional)                                     │
│  [https://your-domain.com/api/webhooks/stripe/abc123]       │
│  ⓘ Stripe will send order updates here                     │
│  📋 Copy URL                                                │
│                                                              │
│  ⚠️  Important Setup Steps:                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Copy checkout URL (already done!)                │  │
│  │  2. Add webhook URL to Stripe Dashboard              │  │
│  │  3. Select these events:                             │  │
│  │     • checkout.session.completed                     │  │
│  │     • checkout.session.expired                       │  │
│  │     • payment_intent.succeeded                       │  │
│  │     • payment_intent.payment_failed                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Continue]                                                  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Design Requirements

**URL Fields:**
- Read-only input fields (can't edit, only copy)
- Copy button icon next to each field
- Success toast when copied: "URL copied to clipboard!"

**Checkout URL:**
- Auto-generated: `${APP_URL}/api/checkout/${workspaceId}`
- Green checkmark icon
- "Automatically generated" text (green, small)

**Webhook URL:**
- Auto-generated: `${APP_URL}/api/webhooks/stripe/${workspaceId}`
- Info about what it does

**Setup Instructions Card:**
- Warning alert (amber background)
- Numbered list of setup steps
- "Learn more" link to Stripe webhook docs
- Checkbox list (user can check off as they complete)

---

## Component 4: Step 3 - OpenAI Registration

**Component:** `src/components/checkout/steps/OpenAIRegistration.tsx`

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Register with OpenAI                                       │
│  Final step: Enable checkout in ChatGPT                    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Merchant Configuration                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Merchant ID: merchant_abc123 ✅                      │  │
│  │  API Key: sk-••••••••••••••••• ✅                     │  │
│  │  Checkout URL: /api/checkout/... ✅                   │  │
│  │  Webhook URL: /api/webhooks/... ✅                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Supported Payment Methods                                  │
│  ☑ Credit/Debit Cards                                      │
│                                                              │
│  Supported Countries                                        │
│  [Select countries...                                  ▼]   │
│  🇺🇸 United States   🇨🇦 Canada   🇬🇧 United Kingdom      │
│  🇦🇺 Australia                                             │
│                                                              │
│  Return Policy URL (Optional)                               │
│  [https://example.com/returns___________________]           │
│                                                              │
│  [Register with OpenAI]                                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Design Requirements

**Config Summary Card:**
- Read-only fields showing what will be registered
- Green checkmarks for completed items
- Slate-700 background, rounded corners

**Payment Methods:**
- Checkbox (always checked, disabled)
- "Credit/Debit Cards" label
- Info: "More payment methods coming soon"

**Country Selector:**
- Multi-select dropdown (use Combobox from shadcn/ui)
- Flag emojis for visual appeal
- Default selected: US, CA, GB, AU
- Can select/deselect countries

**Return Policy:**
- Optional text input
- Placeholder: "https://your-store.com/returns"
- Info: "Helps customers understand your return policy"

**Register Button:**
- Large purple primary button
- Loading state: "Registering with OpenAI..." (spinner)
- Success state: "Registered!" (green checkmark, 2 seconds)
- Error state: Show error message below button

---

## Component 5: Step 4 - Test & Verify

**Component:** `src/components/checkout/steps/TestCheckout.tsx`

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Test Your Checkout                                         │
│  Verify everything works before going live                 │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Checkout Status                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🟢 Active                                            │  │
│  │  Your checkout is registered and ready to use        │  │
│  │  Last verified: 2 minutes ago                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Run Tests                                                  │
│  [Test Checkout Endpoint]                                   │
│                                                              │
│  Test Results                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✅ Checkout endpoint responding (245ms)             │  │
│  │  ✅ Stripe connection valid                          │  │
│  │  ✅ OpenAI can reach your endpoint                   │  │
│  │  ✅ Webhook URL configured                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Next Steps                                                 │
│  1. Enable products for checkout in Products page          │
│  2. Submit product feed to OpenAI                          │
│  3. Test a purchase in ChatGPT                             │
│                                                              │
│  [Go to Products] [View Orders Dashboard]                  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Design Requirements

**Status Card:**
- Large status indicator with colored circle
- 🟢 Green = Active
- 🟡 Yellow = Pending verification
- 🔴 Red = Suspended/Error
- Status message and last verified time

**Test Button:**
- Secondary button
- Runs automated tests
- Loading state: "Testing..." with progress indicator
- Runs tests in sequence (show each completing)

**Test Results:**
- List of checks with checkmarks/X marks
- Green checkmark (✅) = passed
- Red X (❌) = failed
- Response time shown in parentheses

**Next Steps:**
- Numbered list of what to do next
- Links to relevant pages
- "Complete Setup" badge when all done

---

## Component 6: Orders Dashboard

**File:** `src/app/dashboard/[workspaceId]/orders/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Orders                                                           │
│  Manage orders from ChatGPT Checkout                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [Search orders...]                    [Filter: All Orders ▼]    │
│                                                                    │
│  Status Filters: [All] [Paid] [Shipped] [Delivered] [Pending]   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Order #  | Customer     | Amount  | Status    | Date      │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  #1234    | john@ex.com  | $129.99 | 🟢 Shipped | 2min ago │  │
│  │           | 2 items      | USD     | Track #... |          │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  #1233    | jane@ex.com  | $45.00  | 🟡 Paid   | 1hr ago  │  │
│  │           | 1 item       | USD     |            |          │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  #1232    | bob@ex.com   | $299.00 | 🟢 Delivered| 1d ago │  │
│  │           | 3 items      | USD     |            |          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Showing 1-50 of 123 orders                  [< 1 2 3 4 5 >]    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Design Requirements

**Search & Filters:**
- Search bar (searches customer email, order number)
- Filter dropdown (All, Paid, Shipped, Delivered, Pending, Cancelled)
- Status pill tabs (like product filters)

**Orders Table:**
- Columns: Order #, Customer, Amount, Status, Date
- Row 1: Main info
- Row 2: Additional details (item count, tracking)
- Status badges:
  - 🟢 Green = Shipped, Delivered
  - 🟡 Yellow = Paid, Pending
  - 🔴 Red = Cancelled, Failed
- Clickable rows → opens order detail modal

**Empty State:**
```
     📦
  No orders yet
  Orders will appear here once customers
  purchase through ChatGPT
```

---

## Component 7: Order Detail Modal

**Component:** `src/components/orders/OrderDetailModal.tsx`

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Order #1234                                    [X]    │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Status: 🟢 Shipped                                    │
│  Tracking: [1Z999AA1012345678]  [Track Package →]     │
│                                                         │
│  Customer                                              │
│  ┌────────────────────────────────────────────────┐   │
│  │  john@example.com                              │   │
│  │  123 Main St, San Francisco, CA 94103         │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  Items (2)                                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  [img] Cool T-Shirt × 1    $19.99              │   │
│  │  [img] Leather Jacket × 1  $110.00             │   │
│  │  ──────────────────────────────────            │   │
│  │  Subtotal:                $129.99              │   │
│  │  Shipping:                 $0.00               │   │
│  │  Tax:                      $0.00               │   │
│  │  ──────────────────────────────────            │   │
│  │  Total:                   $129.99 USD          │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  Update Status                                         │
│  [Status ▼]  [Tracking Number____________]            │
│  [Update Order]                                        │
│                                                         │
│  Timeline                                              │
│  • Delivered - Jun 15, 2:30 PM                        │
│  • Shipped - Jun 14, 9:00 AM                          │
│  • Paid - Jun 14, 8:45 AM                             │
│  • Created - Jun 14, 8:45 AM                          │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Design Requirements

**Order Header:**
- Order number (large, bold)
- Current status badge (colored)
- Tracking number input (if shipped)
- "Track Package" link (opens carrier tracking)

**Customer Info Card:**
- Email
- Shipping address (formatted)
- Slate-700 background

**Items List:**
- Product image (48x48)
- Product name × quantity
- Line item prices
- Subtotal, shipping, tax breakdown
- Total amount (bold, larger)

**Update Section:**
- Status dropdown (change order status)
- Tracking number input
- "Update Order" button (saves changes)

**Timeline:**
- Vertical timeline with bullet points
- Timestamps for each status change
- Most recent at top

---

## Responsive Design

**Desktop (>1024px):**
- Wizard: Full width, max 800px centered
- Orders table: Full table layout

**Tablet (768px - 1024px):**
- Wizard: Full width
- Orders table: Slightly condensed

**Mobile (<768px):**
- Wizard: Full width, larger touch targets
- Step progress: Smaller circles, abbreviated labels
- Orders: Card layout instead of table
  ```
  ┌───────────────────────┐
  │ #1234  🟢 Shipped    │
  │ john@example.com      │
  │ $129.99  •  2min ago │
  └───────────────────────┘
  ```

---

## v0 Generation Instructions

**Prompt for v0:**

"Create a premium dark-themed checkout setup wizard for ChatGPT Shopping using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

Design system:
- Dark slate background (#0f172a)
- Slate-800 cards
- Purple primary (#8b5cf6), Amber accent (#f59e0b), Emerald success (#10b981)
- Inter font family
- Clean, professional, boutique agency aesthetic

Main wizard flow:
1. **Progress Indicator**: Horizontal step indicator with 4 steps (Stripe → URLs → Register → Test)
2. **Step 1 - Stripe Connection**: Three input fields (publishable key, secret key, webhook secret) with show/hide toggles, validation button
3. **Step 2 - Checkout URLs**: Read-only URL fields with copy buttons, setup instructions card
4. **Step 3 - OpenAI Registration**: Config summary, country selector, registration button
5. **Step 4 - Test & Verify**: Status card, test button, test results checklist

Also create:
- **Orders Dashboard**: Table with search, filters, status badges
- **Order Detail Modal**: Customer info, items list, status update, timeline

Use shadcn/ui components: Dialog, Input, Button, Select, Checkbox, Table, Badge, Tabs, Combobox.

Make it feel like a premium product - smooth animations, clear feedback, helpful guidance throughout."

---

## Sample Data for v0 Preview

```typescript
// Wizard state
const wizardData = {
  currentStep: 2, // Step 2 of 4
  completed: ['stripe', 'urls'],
  pending: ['register', 'test'],
};

// Checkout config
const checkoutConfig = {
  stripePublishableKey: 'pk_test_51234567890',
  stripeSecretKey: '***masked***',
  checkoutUrl: 'https://app.example.com/api/checkout/workspace123',
  webhookUrl: 'https://app.example.com/api/webhooks/stripe/workspace123',
  isConfigured: true,
  openaiCheckoutId: 'checkout_abc123',
  status: 'active',
  lastVerifiedAt: new Date(),
};

// Sample orders
const orders = [
  {
    id: '1',
    orderNumber: '#1234',
    customerEmail: 'john@example.com',
    totalAmount: 129.99,
    currency: 'USD',
    status: 'SHIPPED',
    trackingNumber: '1Z999AA1012345678',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    items: [
      { name: 'Cool T-Shirt', quantity: 1, price: 19.99 },
      { name: 'Leather Jacket', quantity: 1, price: 110.00 },
    ],
  },
];
```

---

## Notes for Implementation

- All steps are separate components for modularity
- Use `useState` to track current wizard step
- Save progress to backend after each step
- Show loading states during API calls
- Add confetti animation when setup completes
- Use `sonner` for toast notifications
- Validate inputs before allowing "Continue"
- Auto-copy webhook URL when moving to Stripe dashboard

These components will be wired up to tRPC endpoints in Cursor.
