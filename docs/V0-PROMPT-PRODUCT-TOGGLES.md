# v0 Prompt: Product Toggles for ChatGPT Shopping

## Design System (Same as Feed Dashboard)

**Colors:** Purple primary, Amber accent, Emerald success, Slate dark theme
**Font:** Inter
**Component Library:** shadcn/ui

---

## Component: Product Search & Toggle Table

**File:** `src/app/dashboard/[workspaceId]/products/page.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Products                                                             │
│  Control which products appear in ChatGPT Shopping                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Search products...]                    [Bulk Actions ▼]            │
│                                                                        │
│  Filters: [All] [Search Enabled] [Checkout Enabled] [Missing GTIN]  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  ☐  | Image | Product Name         | Price | Search | Checkout  ││
│  ├──────────────────────────────────────────────────────────────────┤│
│  │  ☐  | [img] | Cool T-Shirt         | $19.99 |  ☑    |   ☐      ││
│  │     |       | Red, Size M          |        |        |          ││
│  ├──────────────────────────────────────────────────────────────────┤│
│  │  ☐  | [img] | Leather Jacket       | $129   |  ☑    |   ☑      ││
│  │     |       | Black, Size L        |        |        |          ││
│  ├──────────────────────────────────────────────────────────────────┤│
│  │  ☐  | [img] | Running Shoes        | $89.99 |  ☐    |   ☐      ││
│  │     |       | ⚠ Missing GTIN       |        |        |          ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                        │
│  Showing 1-50 of 245 products                    [< 1 2 3 4 5 >]    │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Design Requirements

**1. Header Section**
- Page title: "Products" (text-2xl font-semibold)
- Subtitle: "Control which products appear in ChatGPT Shopping" (text-slate-400)
- Search bar (left): Full-width input with search icon
- Bulk Actions dropdown (right): Floating button

**2. Filter Tabs**
- Horizontal pill-style tabs (using `Tabs` component from shadcn/ui)
- Options:
  - "All" - Show all products
  - "Search Enabled" - Only products with enableSearch=true
  - "Checkout Enabled" - Only products with enableCheckout=true
  - "Missing GTIN" - Products without GTIN/MPN
  - "Low Optimization" - Products with score < 7
- Active tab: purple background, others: slate-700
- Count badges next to each label (e.g., "All (245)")

**3. Bulk Actions Dropdown**
- Dropdown menu (use `DropdownMenu` component)
- Options:
  - "Enable Search for Selected"
  - "Disable Search for Selected"
  - "Enable Checkout for Selected"
  - "Disable Checkout for Selected"
  - Separator
  - "Enable Search for All"
  - "Enable Checkout for All"
- Icon: `MoreVertical` from lucide-react
- Only enabled when products are selected

**4. Products Table**
- Columns:
  1. **Checkbox** - Select row (bulk actions)
  2. **Image** - 48x48px product thumbnail (rounded-md)
  3. **Product Name** - Title + Variant details
  4. **Price** - Formatted currency
  5. **Search Toggle** - Switch component (purple when on)
  6. **Checkout Toggle** - Switch component (amber when on)

**Product Row Details:**
- Main product title: font-semibold text-slate-50
- Variant/subtitle: text-sm text-slate-400
- Warning indicator: ⚠ amber icon + "Missing GTIN" (text-amber-500 text-sm)
- Hover effect: bg-slate-700/50
- Clickable row: opens product detail (not in v0, just add cursor-pointer)

**5. Toggle Switches**
- Use `Switch` component from shadcn/ui
- **Search toggle:**
  - ON: Purple (violet-600)
  - OFF: Slate-600
  - Tooltip: "Enable for ChatGPT Search"
- **Checkout toggle:**
  - ON: Amber (amber-500)
  - OFF: Slate-600
  - Tooltip: "Enable for ChatGPT Checkout"
  - Badge: "Pro" (only show if not on Pro plan)

**6. Pagination**
- Bottom of table
- Shows: "Showing 1-50 of 245 products"
- Page numbers + prev/next arrows
- Use `Pagination` component or custom buttons

### Interactive States

**Toggle State Changes:**
- Instant visual feedback (optimistic update)
- Toast notification: "Product enabled for ChatGPT Search" (green)
- If error, revert toggle and show error toast (red)

**Bulk Actions:**
- When executed, show progress toast: "Updating 15 products..." (with spinner)
- Success: "15 products updated" (green toast)
- Partial success: "12 of 15 products updated, 3 failed" (amber toast)

**Search:**
- Debounced (300ms)
- Shows loading spinner in search input
- Updates table without page reload

### Empty States

**No Products:**
```
     🛍️
  No products found
  Sync your Shopify store to get started
  [Sync Products]
```

**No Search Results:**
```
     🔍
  No products match your search
  Try different keywords or clear filters
```

### Data Requirements (Props)

```typescript
interface ProductToggleData {
  id: string;
  title: string;
  variantTitle?: string;
  imageUrl?: string;
  price: number;
  currency: string;
  enableSearch: boolean;
  enableCheckout: boolean;
  warnings: Array<'missing_gtin' | 'low_optimization' | 'no_image'>;
}

interface ProductsPageData {
  products: ProductToggleData[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  stats: {
    total: number;
    searchEnabled: number;
    checkoutEnabled: number;
    missingGtin: number;
    lowOptimization: number;
  };
}
```

### Actions (To wire up later)

```typescript
- onToggleSearch: (productId: string, enabled: boolean) => Promise<void>;
- onToggleCheckout: (productId: string, enabled: boolean) => Promise<void>;
- onBulkAction: (productIds: string[], action: BulkActionType) => Promise<void>;
- onSearch: (query: string) => void;
- onFilterChange: (filter: FilterType) => void;
- onPageChange: (page: number) => void;
```

---

## Component 2: Product Detail Modal

**Component:** `src/components/products/ProductDetailModal.tsx`

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Product Details                              [X]      │
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Product Image]     Cool T-Shirt                      │
│  200x200             $19.99                            │
│                                                         │
│                      ☑ Enable for ChatGPT Search       │
│                      ☐ Enable for ChatGPT Checkout     │
│                                                         │
│  Feed Compliance                                       │
│  ┌────────────────────────────────────────────────────┐│
│  │  ✓ Title: Present                                  ││
│  │  ✓ Price: $19.99                                   ││
│  │  ✓ Image: Present                                  ││
│  │  ✓ GTIN: 123456789012                              ││
│  │  ⚠ Brand: Missing (recommended)                    ││
│  │  ⚠ Target Audience: Missing (recommended)          ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  Optimization Score: 6/10                              │
│  [View Details]                                        │
│                                                         │
│  [Cancel]  [Save Changes]                             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Design Requirements

- Modal using `Dialog` component
- Left side: Large product image (200x200)
- Right side: Product info + toggles
- Feed compliance checklist:
  - Green checkmark (✓) for present fields
  - Amber warning (⚠) for missing recommended fields
  - Red X (✗) for missing required fields
- Optimization score badge (colored by level)
- "View Details" link opens full product page
- Save button updates toggles

---

## Responsive Design

**Desktop (>768px):**
- Table layout as shown above
- 7 columns visible
- Bulk actions in header

**Tablet (768px - 1024px):**
- Slightly condensed table
- Image column narrower (32x32)
- Price column hidden (show in row expansion)

**Mobile (<768px):**
- Card layout instead of table
- Each product = card:
  ```
  ┌─────────────────────────────────┐
  │ [img]  Cool T-Shirt       $19.99│
  │        Red, Size M              │
  │        🔍 ☑  🛒 ☐              │
  └─────────────────────────────────┘
  ```
- Search and filters collapse into drawer
- Bulk actions in floating action button (bottom-right)

---

## v0 Generation Instructions

**Prompt for v0:**

"Create a product management table for ChatGPT Shopping using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

Design:
- Dark slate theme (#0f172a background, #1e293b cards)
- Purple primary (#8b5cf6), Amber accents (#f59e0b)
- Professional, clean, boutique agency aesthetic

Features:
1. Search bar with debounced input
2. Filter tabs: All, Search Enabled, Checkout Enabled, Missing GTIN, Low Optimization
3. Bulk actions dropdown for selected products
4. Product table with columns: Checkbox, Image, Name (with variant subtitle), Price, Search Toggle (purple), Checkout Toggle (amber)
5. Warning indicators for missing GTIN (amber icon + text)
6. Pagination controls (showing X-Y of Z products)
7. Empty states for no products and no search results

Use shadcn/ui components: Table, Switch, Checkbox, Input, Tabs, DropdownMenu, Badge, Tooltip.

Make responsive:
- Desktop: Full table
- Mobile: Card layout with inline toggles

Include hover effects, loading states, and toast notifications (via sonner)."

---

## Color States for Toggles

```typescript
// Search Toggle (Purple)
const searchToggle = {
  on: 'bg-violet-600 data-[state=checked]:bg-violet-600',
  off: 'bg-slate-600',
  thumb: 'bg-white'
};

// Checkout Toggle (Amber)
const checkoutToggle = {
  on: 'bg-amber-500 data-[state=checked]:bg-amber-500',
  off: 'bg-slate-600',
  thumb: 'bg-white'
};
```

---

## Sample Data for v0 Preview

```typescript
const sampleProducts = [
  {
    id: '1',
    title: 'Cool T-Shirt',
    variantTitle: 'Red, Size M',
    imageUrl: 'https://placehold.co/200x200/purple/white?text=Shirt',
    price: 19.99,
    currency: 'USD',
    enableSearch: true,
    enableCheckout: false,
    warnings: [],
  },
  {
    id: '2',
    title: 'Leather Jacket',
    variantTitle: 'Black, Size L',
    imageUrl: 'https://placehold.co/200x200/amber/white?text=Jacket',
    price: 129.00,
    currency: 'USD',
    enableSearch: true,
    enableCheckout: true,
    warnings: [],
  },
  {
    id: '3',
    title: 'Running Shoes',
    variantTitle: 'Blue, Size 10',
    imageUrl: 'https://placehold.co/200x200/emerald/white?text=Shoes',
    price: 89.99,
    currency: 'USD',
    enableSearch: false,
    enableCheckout: false,
    warnings: ['missing_gtin'],
  },
];
```

---

## Notes for Implementation

- Toggles should have optimistic updates (change immediately, revert on error)
- Bulk actions should show confirmation dialog for destructive actions
- Search should be debounced to avoid excessive API calls
- Filter tabs should update URL params (for deep linking)
- Product rows should be clickable (opens detail view)
- Use `sonner` for toast notifications
- Add loading skeletons for table rows
- Checkbox in header should select/deselect all visible products

These will be connected to tRPC `product.update` mutations in Cursor.
