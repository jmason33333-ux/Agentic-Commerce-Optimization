# v0 Prompt: Feed Dashboard (MVP Phase 1)

## Design System

**Brand Style:** Premium boutique agency aesthetic - sophisticated, clean, professional

**Colors:**
- Primary: Purple `#8b5cf6` (violet-500)
- Accent: Amber `#f59e0b` (amber-500)
- Success: Emerald `#10b981` (emerald-500)
- Background: Slate `#0f172a` (slate-900)
- Cards: `#1e293b` (slate-800)
- Text: `#f8fafc` (slate-50)
- Muted: `#94a3b8` (slate-400)

**Typography:**
- Font: Inter (or system default sans-serif)
- Headings: font-semibold
- Body: font-normal
- Code/mono: font-mono

**Component Library:** shadcn/ui (Radix UI + Tailwind CSS)

---

## Component 1: Feed Status Dashboard

**File:** `src/app/dashboard/[workspaceId]/feed/page.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ChatGPT Shopping Feed                                       │
│  Automatic feed submission and refresh for OpenAI Commerce  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ 🟢 Live          │  │ 245 / 500        │  │ 2 min ago  ││
│  │ Your store is    │  │ Products Indexed │  │ Last Sync  ││
│  │ indexed          │  │                  │  │            ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                           ││
│  │  [Submit Feed to OpenAI]  [Configure Auto-Refresh]      ││
│  │                                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Auto-Refresh Settings                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Frequency: [Dropdown: Manual / Daily / Every 15 Min]   ││
│  │  ☑ Enable automatic feed refresh                        ││
│  │  Next sync: Tomorrow at 9:00 AM                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Recent Submissions                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🟢 Indexed    245 products   2 min ago    Manual       ││
│  │  🟡 Indexing   500 products   1 hour ago   Scheduled    ││
│  │  🔴 Failed     0 products     2 days ago   Manual       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Requirements

**1. Status Cards (Top Row)**
- Three cards side-by-side (grid-cols-3 on desktop)
- Dark slate background (`bg-slate-800`)
- Rounded corners (`rounded-lg`)
- Padding: `p-6`
- Shadow: `shadow-lg`

**Status Card 1: Live Status**
- Large colored circle indicator:
  - 🟢 Green (`text-emerald-500`) = "Live"
  - 🟡 Yellow (`text-amber-500`) = "Syncing..."
  - 🔴 Red (`text-red-500`) = "Not Live"
- Heading: "Live" / "Syncing" / "Not Live" (font-semibold text-lg)
- Subtext: "Your store is indexed in ChatGPT" (text-slate-400 text-sm)

**Status Card 2: Products Count**
- Large number: "245 / 500" (text-3xl font-bold text-slate-50)
- Label: "Products Indexed" (text-slate-400 text-sm)
- Progress bar underneath (thin, purple gradient)

**Status Card 3: Last Sync**
- Relative time: "2 min ago" (text-2xl font-semibold text-slate-50)
- Label: "Last Sync" (text-slate-400 text-sm)
- Clock icon (lucide-react `Clock`)

**2. Action Buttons**
- Two primary action buttons:
  - **"Submit Feed to OpenAI"** - Large purple button (`bg-violet-600 hover:bg-violet-700`)
  - **"Configure Auto-Refresh"** - Secondary button (`bg-slate-700 hover:bg-slate-600`)
- Use `Button` component from shadcn/ui
- Size: `lg`
- Full width on mobile, inline on desktop

**3. Auto-Refresh Settings Card**
- Card with slate-800 background
- Heading: "Auto-Refresh Settings" (text-lg font-semibold)
- Frequency dropdown:
  - Options: "Manual", "Daily", "Every 6 Hours", "Hourly", "Every 15 Minutes (Pro)"
  - Use `Select` component from shadcn/ui
- Checkbox: "Enable automatic feed refresh" (use `Checkbox` component)
- Info text: "Next sync: Tomorrow at 9:00 AM" (text-slate-400 text-sm)
- Badge for "Pro" tier on "Every 15 Minutes" option (amber badge)

**4. Recent Submissions Table**
- Card with slate-800 background
- Heading: "Recent Submissions" (text-lg font-semibold)
- Table with 4 columns:
  1. **Status** - Colored badge (green "Indexed", yellow "Indexing", red "Failed")
  2. **Products** - "245 products"
  3. **Time** - Relative time "2 min ago"
  4. **Trigger** - Badge ("Manual", "Scheduled", "Sync")
- Use `Table` component from shadcn/ui
- Hover effect on rows
- Max 5 rows, then "View All" link

### Interactive States

**Submit Button States:**
- Default: "Submit Feed to OpenAI"
- Loading: "Submitting..." (with spinner)
- Success: "Feed Submitted!" (green checkmark, 2 seconds)
- Error: "Submission Failed" (red X, stays visible)

**Auto-Refresh Toggle:**
- When enabled, show "Next sync: [time]"
- When disabled, show "Manual submissions only"
- Frequency dropdown only enabled when toggle is on

### Data Requirements (Props)

```typescript
interface FeedDashboardData {
  status: 'live' | 'syncing' | 'not_live';
  statusMessage: string;
  productsIndexed: number;
  productsTotal: number;
  lastSyncAt: Date | null;
  autoRefreshEnabled: boolean;
  autoRefreshFrequency: 'MANUAL' | 'DAILY' | 'EVERY_6_HOURS' | 'HOURLY' | 'EVERY_15_MIN';
  nextSyncAt: Date | null;
  recentSubmissions: Array<{
    id: string;
    status: 'INDEXED' | 'INDEXING' | 'FAILED';
    productCount: number;
    submittedAt: Date;
    triggeredBy: 'MANUAL' | 'SCHEDULED' | 'SYNC';
  }>;
}
```

### Actions (Buttons to wire up later)

```typescript
// These will be connected to tRPC later
- onSubmitFeed: () => void;
- onConfigureAutoRefresh: (enabled: boolean, frequency: string) => void;
- onViewSubmission: (id: string) => void;
```

---

## Component 2: Feed Submission Modal

**Component:** `src/components/feed/FeedSubmissionModal.tsx`

### Layout

```
┌────────────────────────────────────────┐
│  Submit Feed to OpenAI          [X]    │
├────────────────────────────────────────┤
│                                         │
│  ☑ Include unoptimized products        │
│     (Products with optimization < 7)   │
│                                         │
│  Feed Preview                           │
│  ┌────────────────────────────────────┐│
│  │ ✓ 245 products eligible             ││
│  │ ⚠ 15 products missing GTIN/MPN      ││
│  │ ⚠ 8 products low optimization       ││
│  │                                      ││
│  │ Estimated feed size: 512 KB         ││
│  └────────────────────────────────────┘│
│                                         │
│  [Cancel]  [Submit Feed]               │
│                                         │
└────────────────────────────────────────┘
```

### Design Requirements

- Use `Dialog` component from shadcn/ui
- Modal size: `max-w-md`
- Dark slate background
- Checkbox to include/exclude low-optimization products
- Preview card showing:
  - Eligible products count (green checkmark)
  - Warning counts (amber warning icon)
  - Estimated feed size
- Action buttons:
  - "Cancel" - ghost button
  - "Submit Feed" - purple primary button

### Data Requirements

```typescript
interface FeedPreviewData {
  eligibleProducts: number;
  missingGtinMpn: number;
  lowOptimization: number;
  estimatedSizeKB: number;
}
```

---

## Component 3: OpenAI Configuration Card

**Component:** `src/components/feed/OpenAIConfigCard.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  OpenAI Configuration                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Merchant ID                                                 │
│  [merchant_abc123_______________________]                    │
│                                                               │
│  API Key                                                     │
│  [sk-**************************_________] [Show]             │
│                                                               │
│  ℹ️  Get your credentials from the OpenAI Commerce dashboard│
│     https://platform.openai.com/commerce                     │
│                                                               │
│  [Save Configuration]                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Requirements

- Card component (slate-800 background)
- Two input fields:
  - **Merchant ID** - Text input
  - **API Key** - Password input with show/hide toggle
- Info alert (blue, subtle) with link to OpenAI docs
- "Save Configuration" button (purple)
- Use `Input` component from shadcn/ui
- Use `Alert` component for the info message

---

## Component 4: Empty State (No Configuration)

**Component:** `src/components/feed/FeedEmptyState.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                      🚀                                       │
│                                                               │
│           Get Started with ChatGPT Shopping                  │
│                                                               │
│  Connect your store to OpenAI and start appearing in         │
│  ChatGPT Shopping results in minutes.                        │
│                                                               │
│  Steps to get live:                                          │
│  1. Get OpenAI Commerce credentials                          │
│  2. Configure your merchant ID and API key                   │
│  3. Submit your product feed                                 │
│  4. Enable auto-refresh (optional)                           │
│                                                               │
│  [Get Started]                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Requirements

- Centered content
- Large emoji or icon
- Heading (text-2xl font-semibold)
- Description text (text-slate-400)
- Numbered list of steps
- Primary CTA button "Get Started" (opens configuration)

---

## Color Palette Reference

```typescript
// Tailwind classes for v0
const colors = {
  primary: 'bg-violet-600 hover:bg-violet-700 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-50',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-slate-900',
  error: 'bg-red-500 text-white',

  card: 'bg-slate-800 border-slate-700',
  background: 'bg-slate-900',
  text: {
    primary: 'text-slate-50',
    secondary: 'text-slate-400',
    muted: 'text-slate-500',
  },

  badge: {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  }
};
```

---

## Component Hierarchy

```
FeedDashboardPage
├── FeedStatusCards
│   ├── LiveStatusCard
│   ├── ProductsIndexedCard
│   └── LastSyncCard
├── FeedActionButtons
│   ├── SubmitFeedButton → opens FeedSubmissionModal
│   └── ConfigureButton → opens settings
├── AutoRefreshSettingsCard
│   ├── FrequencySelect
│   ├── EnableToggle
│   └── NextSyncInfo
└── RecentSubmissionsTable
    └── SubmissionRow[] → links to detail view
```

---

## v0 Generation Instructions

**Prompt for v0:**

"Create a premium dark-themed dashboard for ChatGPT Shopping feed management using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

Design system:
- Dark slate background (#0f172a)
- Slate-800 cards with subtle borders
- Purple primary buttons (#8b5cf6)
- Inter font family
- Clean, professional, boutique agency aesthetic

Main dashboard should include:
1. Three status cards showing: Live status (with colored indicator), Products indexed (with progress bar), Last sync time
2. Two action buttons: 'Submit Feed to OpenAI' (purple) and 'Configure Auto-Refresh' (secondary)
3. Auto-refresh settings card with frequency dropdown and enable toggle
4. Recent submissions table with status badges, product counts, timestamps, and trigger type

Use shadcn/ui components: Button, Card, Select, Checkbox, Table, Badge, Alert.

Make it responsive (mobile-first), accessible, and visually polished. Include loading states and hover effects."

---

## Notes for Implementation

- All components should be **client components** (`'use client'`) for interactivity
- Use `lucide-react` for icons (Clock, CheckCircle2, AlertCircle, Settings, etc.)
- Format dates with `date-fns` (formatDistanceToNow, format)
- Use `shadcn/ui` components from your existing setup
- Add proper TypeScript types for all props
- Include loading skeletons for async data
- Add error boundaries for failed API calls

These components will be wired up to tRPC endpoints in the Cursor integration step.
