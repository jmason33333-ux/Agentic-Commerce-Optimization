# v0 Prompts: Unified ChatGPT Shopping Wizard

**Complete 8-step merchant onboarding wizard for ChatGPT Shopping**

Each prompt below is optimized for v0.dev to generate production-ready React components.

---

## 📋 Table of Contents

1. [Wizard Shell & Progress Indicator](#1-wizard-shell--progress-indicator)
2. [Step 0: Merchant Application Alert](#2-step-0-merchant-application-alert)
3. [Step 1: Connect Shopify Store](#3-step-1-connect-shopify-store)
4. [Step 2: Store Information](#4-step-2-store-information)
5. [Step 3: Product Readiness Review](#5-step-3-product-readiness-review)
6. [Step 4: OpenAI Feed Setup](#6-step-4-openai-feed-setup)
7. [Step 5: Stripe Connection](#7-step-5-stripe-connection)
8. [Step 6: Checkout Configuration](#8-step-6-checkout-configuration)
9. [Step 7: Test & Verify](#9-step-7-test--verify)
10. [Step 8: Success & Dashboard](#10-step-8-success--dashboard)

---

## 1. Wizard Shell & Progress Indicator

### v0 Prompt:

```
Build a premium dark-themed wizard shell for a multi-step onboarding flow using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

**Design System:**
- Dark slate foundation (#0f172a background, #1e293b cards)
- Slate-800 card backgrounds with subtle borders (#334155)
- Purple primary (#8b5cf6), Amber accent (#f59e0b), Emerald success (#10b981)
- Inter typeface with clear hierarchy
- Smooth transitions and micro-interactions

**Core Component: WizardShell**

Container with:
- Full-height layout (min-h-screen)
- Centered content area (max-w-4xl mx-auto)
- Padding: py-12 px-6
- Logo/brand at top
- Progress indicator below
- Step content in card
- Navigation buttons at bottom

**Progress Indicator (Horizontal Stepper):**

8 steps with visual states:
1. ✓ Completed: Filled purple circle with checkmark, purple connecting line
2. → Current: Pulsing purple circle with number, purple glow
3. ○ Upcoming: Gray outline circle with number, gray connecting line

Step labels (show on desktop, hide on mobile):
- Step 0: "Application"
- Step 1: "Shopify"
- Step 2: "Store Info"
- Step 3: "Products"
- Step 4: "Feed"
- Step 5: "Stripe"
- Step 6: "Checkout"
- Step 7: "Verify"

Mobile: Show "Step X of 8" text instead of full labels

**Navigation Buttons:**
- Back button: Secondary style (slate-700), disabled on step 0
- Next/Continue button: Primary purple gradient, disabled when validation fails
- Skip button (optional): Ghost style, shown only on optional steps

**Props Interface:**
```typescript
interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}
```

**Features:**
- Smooth step transitions (fade in/out)
- Progress save indicator: "Auto-saved at 2:34 PM" (top right)
- Exit warning: "Your progress is saved. Are you sure you want to exit?"
- Keyboard navigation: Arrow keys to navigate steps
- Animation: Progress line fills smoothly when step completes

Use shadcn/ui: Button, Card, Progress (for mobile), Badge, AlertDialog (for exit warning)

**Responsive:**
- Desktop (>1024px): Full step labels, larger card
- Tablet (768-1024px): Abbreviated labels
- Mobile (<768px): "Step X of 8" text, stacked buttons
```

---

## 2. Step 0: Merchant Application Alert

### v0 Prompt:

```
Build a merchant application alert screen for Step 0 of the ChatGPT Shopping wizard using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Centered card with:
- Alert icon (amber exclamation triangle)
- Heading: "Before We Begin: Merchant Application Required"
- Subheading: "ChatGPT requires merchant approval before you can start selling"

**Content Sections:**

1. **Application Status Selector:**
   Radio group with 3 options:
   - ○ "I haven't applied yet" → Shows application guide
   - ○ "I've applied and waiting for approval" → Shows tracking info
   - ○ "I'm already approved" → Unlocks continue button

2. **What You'll Need (Expandable):**
   Accordion with checklist:
   - ✓ Valid business license or registration
   - ✓ Product catalog ready
   - ✓ Return and refund policy
   - ✓ Customer support contact
   - ✓ Privacy policy and terms of service

3. **Application Timeline:**
   Visual timeline (horizontal):
   - Apply → 1-2 days → Under Review → 3-5 days → Approved/Rejected
   Info badge: "Approval can take 1-7 days"

4. **Important Notes (Info Box):**
   Blue info alert:
   "You can complete setup now and submit your feed later when approved. Your progress is saved."

**CTA Buttons:**

Primary section:
- "Apply at chatgpt.com/merchants" → Opens in new tab (external link icon)
- "I've Already Applied" → Continue to Step 1

Secondary:
- "Skip for Now" → Ghost button, continues to Step 1 with warning banner

**State Management:**
```typescript
interface ApplicationStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  applicationDate?: Date;
  approvalDate?: Date;
}
```

**Features:**
- Auto-detect if merchant credentials exist (show "approved" state)
- Warning banner if skipping: "Remember to apply before submitting your feed"
- Application status saved to backend when selected
- Smooth transitions between radio states

Use shadcn/ui: Card, RadioGroup, Accordion, Alert, Button, Badge, ExternalLink icon

**Responsive:**
- Desktop: Two-column layout (guide left, timeline right)
- Mobile: Stacked layout
```

---

## 3. Step 1: Connect Shopify Store

### v0 Prompt:

```
Build a Shopify connection screen for Step 1 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Centered card with two states: "Connect" and "Connected"

**State 1: Not Connected**

Header:
- Shopify logo (green shopping bag icon)
- Heading: "Connect Your Shopify Store"
- Subheading: "We'll automatically import your products, store information, and policies"

Features Grid (3 columns on desktop):
1. 🔒 Secure OAuth
   "Bank-level encryption"
2. 📦 Auto-Import
   "Products, images, inventory"
3. ⚡ Real-Time Sync
   "Updates automatically"

Connection Form:
- Input field: "your-store.myshopify.com"
- Placeholder: "example-store"
- Suffix text: ".myshopify.com" (grayed out)
- Helper text: "Enter your Shopify store name"
- Validation: Format check, show error if invalid

Connect Button:
- Primary purple gradient
- Full width on mobile
- Loading state: "Connecting..."
- Disabled until valid store name entered

What Happens Next (Accordion - collapsed by default):
- "You'll be redirected to Shopify to authorize"
- "We'll import your product catalog"
- "Setup continues automatically"

**State 2: Connected (Success)**

Success card (green glow):
- ✓ Checkmark icon (emerald)
- "Connected to {store-name}"
- Store domain badge
- Connection timestamp: "Connected 2 minutes ago"

Import Summary:
- Products imported: 127 (with loading animation during import)
- Images imported: 456
- Last synced: Just now

Actions:
- "View Products" → Link to product page
- "Disconnect" → Ghost button (confirmation dialog)
- "Re-sync Now" → Secondary button

Loading State (During Import):
- Shimmer skeleton for product count
- Progress text: "Importing products... 45 of 127"
- Animated dots

**Error Handling:**

Error states:
- Invalid store name: "Store not found. Check your store name."
- OAuth failed: "Connection failed. Please try again."
- Import failed: "Products imported with errors. 3 products skipped."

Error card (red border):
- Error icon
- Error message
- "Try Again" button
- "Contact Support" link

**Features:**
- Auto-focus input on mount
- Press Enter to connect
- Validate store name format before enabling button
- Show estimated time for large stores: "~2 minutes for 500+ products"

Use shadcn/ui: Card, Input, Button, Badge, Alert, Skeleton, Accordion, AlertDialog

**Responsive:**
- Desktop: Features in 3-column grid
- Mobile: Stacked features, full-width input
```

---

## 4. Step 2: Store Information

### v0 Prompt:

```
Build a store information form for Step 2 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Form card with auto-populated fields from Shopify

**Header:**
- Heading: "Verify Your Store Information"
- Subheading: "This information will appear in ChatGPT when customers shop"
- Badge: "Auto-populated from Shopify" (purple)

**Form Fields:**

1. **Store Name** (Required)
   - Input with edit icon
   - Default: Populated from Shopify shop.name
   - Placeholder: "Your Store Name"
   - Helper: "This is shown to customers in ChatGPT"

2. **Store Website URL** (Required)
   - Input type URL
   - Default: Populated from Shopify domain
   - Validation: Must be valid URL
   - Helper: "Your main storefront URL"

3. **Privacy Policy URL** (Required)
   - Input type URL
   - Default: Populated from Shopify policies
   - "Not set up yet?" → Link to Shopify settings
   - Validation: Must be accessible URL
   - Warning if missing: "Required by OpenAI"

4. **Terms of Service URL** (Required)
   - Input type URL
   - Default: Populated from Shopify policies
   - Same pattern as Privacy Policy

5. **Return Policy** (Required)
   - Textarea (4 rows)
   - Default: Populated from Shopify refund policy
   - Character count: "142 / 500 characters"
   - Helper: "Describe your return policy in plain language"

6. **Return Window** (Required)
   - Select dropdown
   - Options: 15 days, 30 days, 45 days, 60 days, 90 days
   - Default: 30 days
   - Icon: Calendar

**Field States:**

Auto-populated indicator (each field):
- Green checkmark if populated from Shopify
- Edit pencil icon to modify
- Orange warning if empty: "Please provide this information"

**Preview Card (Right Side on Desktop):**

"How This Appears in ChatGPT" preview:
- Mock ChatGPT interface
- Shows store name, policies as links
- Return policy excerpt
- Updates live as user types

**Validation:**

Real-time validation:
- URLs must be valid format
- Return policy min 50 characters
- All required fields must be filled
- Show field-level errors below inputs
- Global error summary at top if any invalid

**Features:**
- Auto-save draft every 30 seconds (show "Saved" indicator)
- Reset to Shopify defaults button
- "Why is this required?" tooltips (info icons)
- Smooth transitions when fields are edited

Use shadcn/ui: Card, Input, Textarea, Select, Label, Button, Badge, Tooltip, Alert

**Responsive:**
- Desktop: Form left (60%), preview right (40%)
- Tablet: Form full width, preview below (collapsible)
- Mobile: Form only, preview hidden
```

---

## 5. Step 3: Product Readiness Review

### v0 Prompt:

```
Build a product readiness review screen for Step 3 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme with data tables.

**Layout:**

Two-section layout with summary and product list

**Header Section:**

Summary Cards (3 columns):
1. 🟢 Ready to Sell
   - Large number: "67"
   - "Products meet requirements"
   - Green accent

2. 🔴 Need Attention
   - Large number: "23"
   - "Missing required fields"
   - Red accent

3. 📊 Compliance Rate
   - Large percentage: "74%"
   - Progress bar (purple)
   - "Good start!"

Info Banner (Amber):
"Only products meeting OpenAI requirements can be enabled. You can optimize the incomplete products after setup completes."

**Filter Tabs:**
- All Products (90)
- ✓ Ready (67)
- ⚠️ Incomplete (23)
- 🔍 Search Enabled (0)
- 🛒 Checkout Enabled (0)

**Product Table:**

Columns:
1. Checkbox (bulk select)
2. Image (60x60 thumbnail)
3. Product Name
4. Price
5. Status Badge
6. Missing Fields (if incomplete)
7. Toggle Controls (if ready)

**Status Badges:**
- 🟢 Ready: Green badge "Complete"
- 🔴 Incomplete: Red badge "X fields missing"
- Hover: Show missing fields tooltip

**Toggle Controls (Ready Products Only):**

Two toggle switches per product:
- 🔍 Search: ON/OFF
- 🛒 Checkout: ON/OFF

For incomplete products:
- Toggles disabled (grayed out)
- Tooltip: "Complete required fields to enable"
- "Optimize Later" link

**Incomplete Product Row:**

Expandable details:
- Click row to expand
- Shows missing fields list:
  - ❌ GTIN or MPN
  - ❌ Brand
  - ❌ Weight
- Each field has "Why required?" info icon
- "Fix After Setup" button (secondary)

**Bulk Actions Bar (When Products Selected):**

Sticky bottom bar appears:
- "5 products selected"
- "Enable Search for All" button
- "Enable Checkout for All" button
- "Deselect All" link
- Only enabled if all selected products are ready

**Search & Sort:**
- Search bar: "Search products..."
- Sort dropdown: "Sort by: Name, Price, Status, Compliance Score"
- Filter: "Show only: Ready / Incomplete / All"

**Empty States:**

If no products:
- Empty state illustration
- "No products imported yet"
- "Re-sync with Shopify" button

If all complete:
- Success illustration
- "All products are ready! 🎉"
- "Continue to feed setup" button

**Features:**
- Real-time search filtering
- Toggle state persists immediately
- Bulk select with Shift+click
- Keyboard navigation (arrow keys)
- Smooth row expansion animations
- Loading skeletons during data fetch

**Data Structure:**
```typescript
interface Product {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  isCompliant: boolean;
  missingFields: string[];
  complianceScore: number;
  enableSearch: boolean;
  enableCheckout: boolean;
  canEnable: boolean;
}
```

Use shadcn/ui: Card, Table, Badge, Checkbox, Switch, Input, Button, Select, Tooltip, Collapsible, Skeleton

**Responsive:**
- Desktop: Full table with all columns
- Tablet: Hide some columns, show on expand
- Mobile: Card layout instead of table, stack info vertically
```

---

## 6. Step 4: OpenAI Feed Setup

### v0 Prompt:

```
Build an OpenAI feed configuration screen for Step 4 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Two-state screen: "Configure" vs "Configured"

**State 1: Configure Feed**

Header:
- OpenAI logo (or ChatGPT icon)
- Heading: "Connect to OpenAI Commerce"
- Subheading: "Submit your product feed to appear in ChatGPT Shopping"

Status Check (Conditional):
- If merchant application pending: Amber alert
  "Your merchant application is pending approval. You can configure now and submit later."
- If approved: Green success message
  "Your merchant account is approved! Ready to submit."

**Credentials Section:**

1. **Merchant ID** (Required)
   - Input field
   - Helper: "Find this at platform.openai.com/commerce"
   - "Where do I find this?" → Tooltip with screenshot
   - Validation: Format check

2. **API Key** (Required)
   - Password input (toggle visibility)
   - Helper: "Your OpenAI Commerce API key"
   - "Generate new key" → Link to OpenAI platform
   - Validation: Must start with "sk-"

**Feed Configuration:**

Auto-Refresh Frequency (Radio cards):
3 options styled as cards with pricing tiers:

1. 📝 Manual (FREE)
   - "Update when you want"
   - "Best for: Stable catalogs"
   - Badge: "Free Plan"

2. 📅 Daily (BASIC - $29/mo)
   - "Auto-update once per day"
   - "Best for: Regular updates"
   - Badge: "Recommended"
   - Lock icon if not on plan

3. ⚡ Every 15 Minutes (PRO - $99/mo)
   - "Near real-time sync"
   - "Best for: High-volume stores"
   - Badge: "Pro Plan"
   - Lock icon if not on plan

Feed Preview (Collapsible):
- "Preview Your Feed" accordion
- Shows first 3 products in XML/JSON format
- Syntax highlighting
- Copy button
- "Download full feed" link

**Submit Section:**

Feed Summary Card:
- Products ready: 67
- Products incomplete: 23
- Estimated feed size: 2.3 MB
- Last updated: Never / timestamp

Submit Button States:
1. Not configured: "Save Configuration" (gray)
2. Configured, ready: "Submit Feed to OpenAI" (purple gradient, large)
3. Submitting: "Submitting... 45%" (with progress bar)
4. Success: "Feed Submitted ✓" (green)

**State 2: Feed Submitted (Success)**

Success card:
- ✓ Large checkmark (emerald)
- "Feed Successfully Submitted!"
- Submission details:
  - Submitted at: 2:34 PM
  - Products submitted: 67
  - Feed ID: feed_abc123xyz
  - Status: "Pending Review"

Timeline (What's Next):
- Now: Feed submitted ✓
- 30-60 sec: OpenAI validates feed ⏳
- 1-7 days: Manual review 🔍
- When approved: Products go live 🎉

Actions:
- "View Submission History" → Link
- "Update Feed" → Secondary button
- "Configure Auto-Refresh" → Link to settings

**Progress States:**

During submission:
- Progress bar with steps:
  1. Validating products...
  2. Generating feed...
  3. Submitting to OpenAI...
  4. Complete!
- Estimated time: "~30 seconds"
- Live update of each step

**Error Handling:**

Validation errors before submit:
- "3 products have errors" → Expandable list
- Each error shows: Product name, issue, fix suggestion
- "Fix Issues" button → Goes back to Step 3

Submission errors:
- Error card (red border)
- Error message from OpenAI
- "Retry" button
- "Contact Support" link

**Features:**
- Save credentials without submitting (draft mode)
- Test connection button (validates API key)
- Auto-detect if merchant already approved
- Show submission history in sidebar
- Estimate submission time based on product count

Use shadcn/ui: Card, Input, Button, RadioGroup, Badge, Alert, Accordion, Progress, Collapsible

**Responsive:**
- Desktop: Feed preview sidebar (right)
- Tablet: Feed preview below
- Mobile: Feed preview accordion
```

---

## 7. Step 5: Stripe Connection

### v0 Prompt:

```
Build a Stripe connection screen for Step 5 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Form card for Stripe configuration

**Header:**
- Stripe logo (purple/blue gradient)
- Heading: "Connect Your Stripe Account"
- Subheading: "Process payments through ChatGPT Shopping"

**Mode Selector (Toggle):**

Prominent toggle at top:
- Test Mode (left, orange badge)
- Live Mode (right, green badge)
- Description changes based on selection
- Warning when switching modes: "Make sure all keys match this mode"

**Credentials Form:**

Three key fields with reveal toggles:

1. **Publishable Key**
   - Input with eye icon (show/hide)
   - Placeholder: "pk_test_... or pk_live_..."
   - Helper: "Starts with pk_test or pk_live"
   - Auto-detect mode from key prefix
   - Warning if mode mismatch

2. **Secret Key**
   - Password input with eye icon
   - Placeholder: "sk_test_... or sk_live_..."
   - Helper: "Starts with sk_test or sk_live"
   - Security warning: "Never share this key"
   - Auto-detect mode from key prefix

3. **Webhook Secret**
   - Password input with eye icon
   - Placeholder: "whsec_..."
   - Helper: "From Stripe Dashboard → Webhooks"
   - "How to find this?" → Popover with instructions

**Validation Section:**

Test Connection card:
- "Validate Your Keys" button
- States:
  - Not tested: Gray button
  - Testing: Loading spinner "Validating..."
  - Success: Green checkmark "All keys valid ✓"
  - Error: Red X "Invalid keys" with details

Validation checks (shown after test):
- ✓ Publishable key valid
- ✓ Secret key valid
- ✓ Webhook secret valid
- ✓ Keys match selected mode (Test/Live)
- ⚠️ Warning if mixing test/live keys

**Where to Find Your Keys:**

Expandable help section (accordion):
- Step-by-step guide with screenshots
- "1. Go to dashboard.stripe.com"
- "2. Navigate to Developers → API Keys"
- "3. Copy your keys"
- "Open Stripe Dashboard" button (external link)

**Mode Indicator Badge:**

Persistent badge showing current mode:
- Test Mode: Orange badge "🧪 Test Mode" (top right)
- Live Mode: Green badge "🚀 Live Mode" (top right)
- Tooltip explaining the difference

**Security Notice:**

Info box (blue):
- "🔒 Your keys are encrypted and stored securely"
- "We never see your full secret key"
- "Keys are used only for checkout processing"

**Features:**
- Auto-detect test/live mode from key format
- Warn if keys don't match mode
- Real-time format validation
- Copy button for each input (for pasting)
- Show masked version after saving: "sk_live_•••••••••"

Use shadcn/ui: Card, Input, Button, Switch, Badge, Alert, Accordion, Popover, Label, Tooltip

**Responsive:**
- Desktop: Single column form, help sidebar
- Tablet: Stacked layout
- Mobile: Full-width inputs, help accordion below
```

---

## 8. Step 6: Checkout Configuration

### v0 Prompt:

```
Build a checkout configuration screen for Step 6 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme.

**Layout:**

Three-section card: Endpoints, Countries, Registration

**Section 1: Checkout Endpoints**

Header:
- Heading: "Your Checkout Endpoints"
- Subheading: "Auto-generated URLs for OpenAI integration"

Two read-only URL fields:

1. **Checkout Endpoint**
   - Label: "Checkout API URL"
   - Value: "https://yourdomain.com/api/checkout/sessions"
   - Auto-generated based on domain
   - Copy button
   - Status indicator: Green dot "Active"

2. **Webhook Endpoint**
   - Label: "Order Webhook URL"
   - Value: "https://yourdomain.com/api/webhooks/openai"
   - Auto-generated
   - Copy button
   - Status indicator: Green dot "Active"

Info alert (amber):
"You'll need to configure Stripe webhooks. We'll guide you through this."

**Webhook Configuration Guide (Expandable):**

Accordion: "How to Configure Stripe Webhooks"

Step-by-step checklist:
1. ✓ Go to dashboard.stripe.com/webhooks
2. ✓ Click "Add endpoint"
3. ✓ Paste webhook URL: [Copy button]
4. ✓ Select events:
   - checkout.session.completed
   - payment_intent.succeeded
   - payment_intent.failed
   - charge.refunded
5. ✓ Copy signing secret to Step 5

"Open Stripe Dashboard" button (external link)

**Section 2: Supported Countries**

Header:
- Heading: "Supported Countries"
- Subheading: "Select where you can ship and process payments"

Multi-select dropdown (Combobox):
- Searchable country list
- Flag emojis next to country names
- Pre-selected: United States 🇺🇸
- Popular countries at top
- "Select all" / "Deselect all" buttons

Selected countries display:
- Pills/badges for each country
- Remove X button per pill
- Max 3 shown, "And 5 more..." link

Helper text:
"Customers in these countries can checkout via ChatGPT"

**Section 3: Return Policy (Optional)**

Textarea:
- Label: "Additional Return Policy Details"
- Placeholder: "Any specific return instructions for international orders..."
- Character count: "0 / 500"
- Helper: "Optional - supplements your main return policy"

**Configuration Summary Card:**

Right sidebar (desktop) showing config status:

Checklist:
- ✓ Stripe connected
- ✓ Checkout endpoints generated
- ⏳ Stripe webhooks configured
- ✓ Countries selected (5)
- ✓ Return policy provided

Completion: 80% (progress bar)

**Registration Section:**

Header:
- Heading: "Register with OpenAI"
- Subheading: "Final step to enable checkout"

Registration status:
- Not registered: "Ready to register" with button
- Registering: "Registering... 50%" with progress
- Registered: Green success "Registered ✓" with timestamp

Register button:
- Large, primary purple
- "Register Checkout with OpenAI"
- Disabled until all requirements met
- Tooltip on hover if disabled: "Complete requirements above"

After registration:
- Success card (green glow)
- "Checkout Registered Successfully!"
- Checkout ID: "checkout_abc123"
- Registered at: timestamp
- Next steps: "You can now test checkout"

**Error Handling:**

Registration errors:
- Error card (red border)
- Error message
- Common issues:
  - Invalid endpoints
  - Countries not supported
  - OpenAI credentials invalid
- "Retry" button
- "Troubleshoot" link

**Features:**
- Auto-generate endpoints from workspace domain
- Test endpoint connectivity (ping test)
- Validate country selection (at least 1 required)
- Auto-save configuration
- Show registration history

Use shadcn/ui: Card, Input, Button, Combobox, Badge, Alert, Accordion, Textarea, Progress, Checkbox, Popover

**Responsive:**
- Desktop: Main form left (70%), summary right (30%)
- Tablet: Stacked layout, summary at top
- Mobile: Full-width form, summary accordion
```

---

## 9. Step 7: Test & Verify

### v0 Prompt:

```
Build a testing and verification screen for Step 7 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme with system checks.

**Layout:**

Testing dashboard with status indicators and diagnostics

**Header:**
- Heading: "Test Your Setup"
- Subheading: "Verify all integrations are working correctly"

**Quick Stats Bar (Top):**

4 stat cards (horizontal):
1. 🟢 Systems Operational: 7/7
2. ⏱️ Avg Response Time: 145ms
3. ✅ Products Ready: 67
4. 🚀 Ready to Launch: Yes

**Test Suites:**

Three collapsible sections, each with run button:

**Suite 1: Connection Tests**
- Shopify Connection
  - Status: ⏳ Not tested / ✓ Success / ❌ Failed
  - Response time: 123ms
  - Last tested: 2 min ago
  - "Re-test" button

- OpenAI Feed API
  - Status indicators
  - Response time
  - Feed submission status

- Stripe API
  - Status indicators
  - Test mode/live mode badge
  - Response time

**Suite 2: Data Validation Tests**
- Store Information Complete
  - ✓ All required fields present
  - ⚠️ 1 warning (show details)

- Product Data Quality
  - ✓ 67 products compliant
  - ⚠️ 23 products incomplete
  - "View incomplete" link

- Feed Format Valid
  - ✓ XML valid
  - ✓ All required fields present
  - File size: 2.3 MB

**Suite 3: Checkout Flow Tests**
- Checkout Endpoints
  - ✓ Endpoint reachable
  - Response time: 156ms
  - SSL certificate valid

- Webhook Configuration
  - ✓ Webhook endpoint active
  - ✓ Stripe events configured
  - Last webhook received: Never

- Payment Processing
  - "Run Test Transaction" button
  - Test with $0.50 charge
  - Refund automatically

**Run All Tests Button:**

Large centered button:
- "Run All Tests"
- Runs all suites sequentially
- Shows progress: "Testing... 3 of 7"
- Overall progress bar
- Estimated time: "~30 seconds"

**Results Display:**

After tests complete:

Summary Card:
- Overall status: All Systems Go ✓ / Issues Found ⚠️
- Tests passed: 7/7
- Tests failed: 0
- Tests with warnings: 1
- Total time: 28 seconds

Detailed Results (Table):
| Component | Status | Response Time | Details |
|-----------|--------|---------------|---------|
| Shopify | ✓ | 123ms | Connected |
| OpenAI Feed | ✓ | 234ms | Ready |
| Stripe | ✓ | 145ms | Test mode |
| Products | ⚠️ | - | 23 incomplete |
| Checkout | ✓ | 156ms | Operational |
| Webhooks | ✓ | 89ms | Configured |

**Issue Resolution:**

If any test fails, show:
- Error card with details
- Suggested fix
- "Fix Now" button → Goes to relevant step
- "Skip for now" option with warning

Example error:
- ❌ Webhook endpoint unreachable
- Issue: SSL certificate invalid
- Fix: "Update your SSL certificate"
- Button: "Go to Settings"

**Manual Test Option:**

"Test Checkout Flow Manually" section:
- "Generate Test Order" button
- Creates mock order in ChatGPT
- QR code to scan (mobile test)
- Order ID to track
- "View in Dashboard" link

**Performance Metrics:**

Charts (optional, if passing all tests):
- Response time history (line chart)
- Uptime last 24h (area chart)
- Test success rate (donut chart)

Use Chart.js or Recharts for visualizations

**Next Steps Card:**

After all tests pass:
- Success message: "Everything looks great! 🎉"
- What's next:
  1. ✓ Setup complete
  2. → Review dashboard
  3. → Submit first feed
  4. → Monitor orders

Primary CTA:
- "Complete Setup →" button (purple gradient, large)

Use shadcn/ui: Card, Button, Badge, Progress, Table, Alert, Collapsible, Tabs, Separator

**Responsive:**
- Desktop: 2-column layout (tests left, results right)
- Tablet: Stacked layout
- Mobile: Accordion for test suites
```

---

## 10. Step 8: Success & Dashboard

### v0 Prompt:

```
Build a success screen and dashboard launcher for Step 8 using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Dark premium theme with celebration.

**Layout:**

Celebration screen with dashboard preview

**Success Animation:**

Top section:
- Confetti animation (use canvas-confetti or lottie)
- Large checkmark icon (emerald, animated)
- Heading: "You're All Set! 🎉"
- Subheading: "Your store is ready to sell on ChatGPT Shopping"

**Setup Summary Card:**

Completion checklist:
- ✓ Shopify store connected
- ✓ Store information verified
- ✓ 67 products enabled
- ✓ Feed submitted to OpenAI
- ✓ Stripe configured
- ✓ Checkout registered
- ✓ All tests passed

Completion time:
- "Completed in 8 minutes"
- Setup started: 2:34 PM
- Setup completed: 2:42 PM

**What's Next Section:**

3 cards (horizontal on desktop):

1. 📦 **Optimize Products**
   - "23 products need attention"
   - "Complete missing fields to enable"
   - Button: "Optimize Now"

2. 📊 **Monitor Dashboard**
   - "Track orders and sales"
   - "Real-time analytics"
   - Button: "View Dashboard"

3. 🔄 **Manage Feed**
   - "Update product feed"
   - "Configure auto-refresh"
   - Button: "Feed Settings"

**Timeline: What Happens Next**

Visual timeline (vertical):

Now:
- ✓ Setup complete
- You can start using the dashboard

1-7 Days:
- ⏳ OpenAI reviews your merchant application
- You'll receive email when approved

When Approved:
- 🎉 Products go live in ChatGPT
- Customers can discover and buy
- Orders appear in your dashboard

**Quick Actions:**

Button grid:
- "Go to Dashboard" (primary, large)
- "View Products"
- "Test Checkout"
- "Invite Team Members"
- "Read Documentation"

**Support & Resources:**

Help card:
- "Need help getting started?"
- Link: "Watch tutorial video"
- Link: "Read setup guide"
- Link: "Contact support"
- Link: "Join community"

**Dashboard Preview (Interactive):**

Live preview iframe or screenshot:
- Miniature dashboard view
- "Click to enlarge" overlay
- Key metrics visible:
  - Orders today: 0
  - Revenue: $0
  - Products live: 67
  - Pending sync: 23

**Settings Quick Access:**

Dropdown menu:
- "Workspace Settings"
- "Team & Billing"
- "Integrations"
- "API Keys"
- "Logout"

**Reminder Banners:**

Conditional alerts:

If merchant application pending:
- Amber alert: "Remember: Your merchant application is still pending approval. We'll email you when approved."

If products incomplete:
- Blue info: "Optimize 23 incomplete products to maximize your catalog reach."

If in test mode:
- Orange warning: "You're in test mode. Switch to live mode when ready to accept real payments."

**Share Success (Optional):**

Social sharing card:
- "Share your achievement!"
- Pre-populated tweet: "Just set up my store on ChatGPT Shopping! 🎉"
- Share buttons: Twitter, LinkedIn
- Copy link button

**Features:**
- Auto-redirect to dashboard after 5 seconds (with countdown)
- "Stay on this page" button to cancel redirect
- Celebration animation plays once
- Save setup completion timestamp
- Track setup funnel completion event

Use shadcn/ui: Card, Button, Badge, Alert, Separator, DropdownMenu

**Responsive:**
- Desktop: 3-column what's next cards, sidebar timeline
- Tablet: 2-column cards, timeline below
- Mobile: Stacked cards, accordion timeline
```

---

## 🎨 Shared Component Library

These components should be created once and reused across all wizard steps:

### 1. FieldWithInfo
```typescript
// Input field with info tooltip
interface FieldWithInfoProps {
  label: string;
  tooltip: string;
  required?: boolean;
  children: React.ReactNode;
}
```

### 2. StatusBadge
```typescript
// Reusable status indicator
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'pending';
  text: string;
}
```

### 3. CopyButton
```typescript
// Copy to clipboard with feedback
interface CopyButtonProps {
  text: string;
  successMessage?: string;
}
```

### 4. LoadingState
```typescript
// Consistent loading indicators
interface LoadingStateProps {
  message: string;
  progress?: number; // 0-100
}
```

### 5. ErrorAlert
```typescript
// Standardized error display
interface ErrorAlertProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 📱 Responsive Guidelines

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Adaptations:**
- Stack all side-by-side layouts
- Hide non-essential info
- Larger touch targets (min 44px)
- Simplified progress indicator
- Bottom-fixed navigation buttons
- Collapsible sections default to collapsed

**Tablet Adaptations:**
- 2-column layouts where possible
- Abbreviated labels in progress indicator
- Maintain most desktop features

---

## 🎯 Common Patterns

**Validation Feedback:**
- Show errors below field
- Red border on invalid input
- Green checkmark on valid input
- Real-time validation after blur

**Loading States:**
- Skeleton loaders for data fetching
- Progress bars for multi-step operations
- Spinner for button actions
- Shimmer effect for content loading

**Success Feedback:**
- Green checkmark icon
- Success message
- Auto-dismiss after 3 seconds (for toasts)
- Persistent for important confirmations

**Error Handling:**
- Red X icon
- Clear error message
- Suggested action
- "Retry" or "Fix" button
- Link to support if needed

---

## ✅ Testing Checklist

For each wizard step, test:
- [ ] Form validation works
- [ ] Error states display correctly
- [ ] Success states display correctly
- [ ] Loading states show during async operations
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility
- [ ] Mobile responsive layout
- [ ] Data persists between steps
- [ ] Back button maintains state
- [ ] Skip functionality (if applicable)

---

**Implementation Notes:**

1. **Generate components in order** (Step 0 → Step 7)
2. **Test each step** before moving to next
3. **Maintain consistent styling** across all steps
4. **Use shared components** to reduce code duplication
5. **Follow shadcn/ui patterns** for all UI elements

Ready to paste each prompt into v0.dev! 🚀
