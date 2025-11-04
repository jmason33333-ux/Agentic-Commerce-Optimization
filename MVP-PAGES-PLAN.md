# MVP Pages & Post-Wizard Experience

## 🎯 Current Situation

The codebase has many pages built for the **v2 optimization-focused product**, but we're launching with a **wizard-focused MVP**. This document clarifies what's MVP vs v2.

---

## ✅ MVP Pages (Launch with these)

### **1. Wizard Flow** (`/wizard`) - ⭐ PRIMARY EXPERIENCE
**Purpose**: Get merchants from zero to live on ChatGPT in 30 minutes

**Steps:**
- `/wizard/step-0` - Merchant Application
- `/wizard/step-1` - Shopify Connection
- `/wizard/step-2` - Store Information
- `/wizard/step-3` - Product Review (enable products)
- `/wizard/step-4` - Feed Configuration
- `/wizard/step-5` - Stripe Configuration
- `/wizard/step-6` - Checkout Registration
- `/wizard/step-7` - Testing & Launch

**Status**: ✅ Complete and production-ready

---

### **2. Dashboard** (`/dashboard`) - **NEEDS MVP REFACTOR**
**Purpose**: Post-wizard home - status overview and quick actions

**What it should show (MVP):**
```
┌─────────────────────────────────────────────────────┐
│ Dashboard                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ✅ Your store is live on ChatGPT!                  │
│                                                     │
│ Quick Stats:                                        │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ 100 Total   │ │ 67 Enabled  │ │ 33 Need     │   │
│ │ Products    │ │ on ChatGPT  │ │ Work        │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│ Feed Status:                                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Last submitted: Jan 15, 2025 2:30 PM           │ │
│ │ Status: Active                                  │ │
│ │ Next auto-refresh: Daily                        │ │
│ │ [Re-submit Feed Now]                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Quick Actions:                                      │
│ [Manage Products] [Edit Store Info] [Settings]     │
│                                                     │
│ 🎯 Complete 33 Products                            │
│    Add missing fields to enable more products      │
│    [View Incomplete Products →]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**What it should NOT show (v2):**
- ❌ SEO Score
- ❌ Compliance Percentage
- ❌ Pending Changes / Suggestions
- ❌ Agentic Orders tracking (analytics v2)

**Status**: ⚠️ Needs refactoring - currently shows v2 features

---

### **3. Products Page** (`/products`) - **NEEDS MVP SIMPLIFICATION**
**Purpose**: View and edit product catalog, complete missing fields

**What it should show (MVP):**
```
┌─────────────────────────────────────────────────────┐
│ Products                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [All Products ▼] [Filter: Incomplete ▼]  [Search]  │
│                                                     │
│ ✅ Premium Leather Wallet - $49                    │
│    Enabled for ChatGPT                             │
│    [Edit] [Disable]                                │
│                                                     │
│ ⚠️ Vintage T-Shirt - $29                           │
│    Missing: Image, GTIN or Brand                   │
│    [Complete Product →]                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features (MVP):**
- List all products
- Filter: All / Enabled / Incomplete
- Search by title
- Show enabled/incomplete status
- Show missing required fields
- Click to edit individual product
- Bulk enable/disable toggle

**What it should NOT show (v2):**
- ❌ Optimization scores
- ❌ 10-dot compliance visualization
- ❌ AI suggestions
- ❌ Bulk optimize
- ❌ Category-based optimization
- ❌ Pending changes indicators

**Status**: ⚠️ Needs refactoring - currently shows v2 features

---

### **4. Product Detail / Edit** (`/products/[id]`) - **NEEDS MVP SIMPLIFICATION**
**Purpose**: Edit individual product to add missing fields

**What it should show (MVP):**
```
┌─────────────────────────────────────────────────────┐
│ Edit Product: Vintage T-Shirt                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Status: ⚠️ Missing Required Fields                 │
│ Missing: Image URL, GTIN or Brand                  │
│                                                     │
│ Required Fields:                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Title: [Vintage T-Shirt            ] ✓          │ │
│ │ Description: [Cotton tee...       ] ✓          │ │
│ │ Price: [$29.99] ✓  Currency: [USD] ✓          │ │
│ │ Image URL: [                      ] ⚠️         │ │
│ │ Product URL: [https://...         ] ✓          │ │
│ │ Availability: [in stock           ] ✓          │ │
│ │ GTIN: [                           ] ⚠️         │ │
│ │ Brand: [                          ] ⚠️         │ │
│ │ (GTIN or Brand required - at least one)        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Save Changes] [Cancel]                            │
│                                                     │
│ After saving with all fields complete:             │
│ ☑️ Enable for ChatGPT Search                       │
│ ☑️ Enable for ChatGPT Checkout                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features (MVP):**
- Simple form for 7 required fields
- Show which fields are missing
- Save changes
- Enable/disable for ChatGPT when complete

**What it should NOT show (v2):**
- ❌ Optimization scoring
- ❌ 8-category breakdown
- ❌ AI-generated suggestions
- ❌ Apply suggestions interface
- ❌ Change history/audit log
- ❌ Compliance audit (25 fields)

**Status**: ⚠️ Needs refactoring - currently shows v2 features

---

### **5. Settings** (`/settings`)
**Purpose**: Manage workspace, reconnect integrations, update credentials

**What it should show (MVP):**
- Workspace name
- Reconnect Shopify (re-run OAuth)
- Update OpenAI credentials
- Update Stripe credentials
- Feed refresh interval
- Supported countries
- Return policy

**Status**: ⚠️ Needs review - may need MVP simplification

---

## 🚫 v2 Pages (Remove/Hide for Launch)

### **1. Bulk Optimize** (`/products/bulk-optimize`) - v2
**Purpose**: AI-powered bulk optimization
**Status**: ❌ Remove from MVP or hide behind feature flag

### **2. Product Compliance Detail** (`/products/[id]/compliance`) - v2
**Purpose**: 25-field compliance audit with AI suggestions
**Status**: ❌ Remove from MVP or hide behind feature flag

### **3. Approvals / Suggestions** (`/approvals`) - v2
**Purpose**: Review and approve AI suggestions (HITL workflow)
**Status**: ❌ Remove from MVP or hide behind feature flag

### **4. Changes** (`/changes`) - v2
**Purpose**: Pending changes management
**Status**: ❌ Remove from MVP or hide behind feature flag

### **5. Analytics** (`/analytics`) - v2
**Purpose**: Agentic order tracking, revenue charts
**Status**: ❌ Remove from MVP or hide behind feature flag

### **6. Celebrations** (`/celebrations`) - v2
**Purpose**: Milestone celebration modals
**Status**: ❌ Remove from MVP or hide behind feature flag

---

## 🎯 Post-Wizard User Journey (MVP)

### **Scenario: Merchant completes wizard**

**Step 1: Wizard Step 7 - Launch**
```
✅ All tests passed!
[Launch Your Store] ← Clicked
```

**Step 2: Redirect to Dashboard**
```
URL: /dashboard

✅ Your store is live on ChatGPT!

67 products enabled and ready to sell
33 products need completed fields

[Manage Products] [Re-submit Feed]
```

**Step 3: Merchant clicks "Manage Products"**
```
URL: /products

Shows list of all products:
- 67 with ✅ Enabled badge
- 33 with ⚠️ Incomplete badge showing missing fields

Merchant filters to "Incomplete"
```

**Step 4: Merchant clicks on incomplete product**
```
URL: /products/prod_123

Simple edit form:
- Shows required fields
- Highlights missing ones
- Merchant adds Image URL and GTIN
- Saves
- Product becomes "Ready"
- Checkboxes appear to enable for ChatGPT
```

**Step 5: Merchant enables newly completed product**
```
Checks:
☑️ Enable for ChatGPT Search
☑️ Enable for ChatGPT Checkout

[Save]

Product now enabled! Needs feed re-submission.
```

**Step 6: Merchant re-submits feed**
```
Back to Dashboard
[Re-submit Feed Now] ← Clicked

✅ Feed submitted successfully!
New product is now live on ChatGPT.
```

---

## 📋 MVP Navigation Structure

```
Main App (After Login):
├── Dashboard (Home)
├── Wizard (if not completed)
├── Products
│   └── [id] (Edit individual product)
└── Settings

Hidden for v2:
├── ❌ Bulk Optimize
├── ❌ Approvals / Suggestions
├── ❌ Changes
├── ❌ Analytics
└── ❌ Celebrations
```

---

## 🔄 What Needs to Be Built/Refactored

### **High Priority (Required for MVP Launch):**

1. **Dashboard Refactor** ⚠️
   - Remove v2 optimization metrics (SEO score, compliance %, pending changes)
   - Show feed submission status
   - Show enabled/incomplete product counts
   - Add "Complete incomplete products" CTA
   - Add quick actions (manage products, settings)

2. **Products Page Simplification** ⚠️
   - Remove optimization scores and 10-dot visualization
   - Show simple "Enabled" vs "Incomplete" status
   - Filter by status
   - Show specific missing fields for incomplete products
   - Clean, simple list view

3. **Product Edit Page Simplification** ⚠️
   - Remove optimization UI (scores, suggestions, compliance audit)
   - Simple form: 7 required fields
   - Show which are complete/incomplete
   - Enable/disable toggles when complete

4. **Hide/Remove v2 Pages**
   - Add feature flags for v2 pages
   - Or remove entirely from routing
   - Remove nav links to v2 features

### **Medium Priority (Nice to have for launch):**

5. **Dashboard Feed Management** 🆕
   - Card showing last feed submission
   - Status indicator
   - Re-submit button
   - Next auto-refresh time

6. **Bulk Product Actions** 🆕
   - Bulk enable/disable in Products page
   - Bulk export incomplete products as CSV

### **Low Priority (Post-launch refinement):**

7. **Settings Improvements**
   - Better organized sections
   - Reconnect Shopify flow
   - Update credentials workflows

---

## 🚀 Recommended Next Steps

1. **Refactor Dashboard** - Priority 1
   - Create MVP-focused dashboard showing feed status and product counts
   - Remove all v2 optimization features

2. **Simplify Products Page** - Priority 2
   - Remove optimization scoring UI
   - Focus on "complete" vs "incomplete" status
   - Clean list with missing fields shown

3. **Simplify Product Edit** - Priority 3
   - Just a form for 7 required fields
   - No optimization features

4. **Hide v2 Pages** - Priority 4
   - Feature flag or remove routing
   - Clean up navigation

---

## 💡 Key Principle

**MVP = Setup Tool (wizard + basic product management)**
**v2 = Optimization Tool (scoring, suggestions, analytics)**

The MVP gets merchants live fast. v2 helps them optimize over time.
