# Phase 1C: Frontend Integration - Cursor Implementation Prompt

## 🎯 Mission

Build the frontend integration for the **Optimization Scoring System** that was just implemented in Phase 1A & 1B. The backend foundation is complete and committed to the `claude/connect-github-repo-011CUcjanU7V7m4Gg96R6swK` branch.

---

## 📚 Required Reading - Backend Context

### 1. Review Backend Implementation (CRITICAL - Read First!)

**Latest Commit**: "Phase 1A & 1B: Implement optimization scoring system"

**Files to Review**:
```
src/lib/optimization/
├── types.ts                 # TypeScript interfaces and constants
├── calculate-score.ts       # 8-category weighted scoring (100 points)
├── calculate-impact.ts      # Score impact calculation for suggestions
├── utils.ts                 # Helper functions (getChangeType, formatPrice, etc.)
└── index.ts                 # Centralized exports

src/server/routers/
├── product.ts              # Enhanced with filtering, update, recalculateScore
├── analytics.ts            # Updated dashboard metrics
└── suggestion.ts           # Enhanced with score recalculation on apply

src/lib/jobs/processor.ts  # Shopify sync with auto-recalculation
prisma/schema.prisma       # Updated Product/Suggestion/Workspace models
```

**Key Backend Exports You'll Use**:
```typescript
// From @/lib/optimization/utils
import {
  getChangeType,           // issueType → "title" | "field" | "description"
  getStockStatus,          // inventory → "In Stock" | "Low Stock" | "Out of Stock"
  getLevelLabel,           // level (1-10) → "Perfect" | "Excellent" | "Ready" etc.
  getLevelColor,           // level → Tailwind color class
  getStatusVariant,        // status → Badge variant
  formatPrice,             // price → "$1,234.56"
  formatPercentage,        // 15.5 → "+15.5%"
  timeAgo,                 // Date → "2h ago"
  getCategoryIcon,         // category → Lucide icon name
  getCategoryName,         // category → "Agent Context"
  meetsBaselineCompliance, // Check if product has required fields
} from '@/lib/optimization/utils';

// TypeScript Types
import type { ScoreBreakdown, ScoreImpact } from '@/lib/optimization/types';
```

### 2. Understand the Optimization Scoring System

**Two-Tier System** (Critical Decision #1):

**Tier 1: Required Fields Check** (Pass/Fail)
- Must have: `title`, `description`, `price`, `imageLink`, `availability`, `(gtin OR mpn)`
- If ANY missing → Status = "missing" (BLOCKED from checkout)

**Tier 2: Optimization Score** (100 points → Level 1-10)

**8 Categories with Weights**:
1. **Core Content Quality** (25 pts) - Title & description richness
2. **Product Identity** (20 pts) - GTIN/MPN, brand, category
3. **Agent-Specific Fields** (20 pts) 🤖 - Use cases, target audience, comparisons
4. **Media Quality** (15 pts) - Images, video, 3D models
5. **Commerce Readiness** (10 pts) - Price, inventory, shipping
6. **SEO Quality** (5 pts) - Product link, structured data
7. **Reviews & Social Proof** (3 pts) - Product & store reviews
8. **Shipping & Fulfillment** (2 pts) - Delivery estimates

**Level Ranges**:
- Level 10: 90-100 points - "Perfect"
- Level 9: 80-89 points - "Excellent"
- **Level 8: 70-79 points - "Ready"** ← Recommended minimum
- Level 7: 60-69 points - "Good"
- Level 6: 50-59 points - "Fair"
- Level 5: 40-49 points - "Needs Work"
- Level 4-1: <40 points - "Poor" to "Critical"

**Product Status**:
- **"ready"**: Level ≥8 AND no pending suggestions
- **"pending"**: Has unapplied suggestions (highest priority)
- **"missing"**: Level <5 OR critical fields missing

**Score Impact Display** (Critical Decision #3):
```typescript
// ✅ SHOW THIS (Score Impact Only)
{
  category: "productIdentity",
  points: +8,
  currentLevel: 7,
  newLevel: 8,
  description: "Adding GTIN: +8 points (Level 7 → 8)"
}

// ❌ DO NOT SHOW (No Business Claims Until We Have Data)
- "+15% discoverability"
- "Expected revenue increase"
- "Conversion rate improvement"
```

**Recalculation Triggers** (Critical Decision #2):
- ✅ Shopify sync completes (every 15 min or daily)
- ✅ Merchant manually edits product
- ✅ Suggestion approved and applied
- ✅ Manual recalculation via endpoint
- ❌ NOT on every inventory change (cost-effective!)

---

## 🎨 Frontend Components Already in Repo

**v0 Components Available** (from previous merge):
```
src/components/
├── stat-card.tsx                 # Dashboard stat cards
├── compliance-indicator.tsx      # 10-dot visual indicator
├── product-status-badge.tsx      # Status badge (ready/pending/missing)
├── ai-suggestion-card.tsx        # Suggestion display card
├── products-table.tsx            # Products list table
├── products-filters.tsx          # Filter controls
├── product-detail-header.tsx     # Product page header
├── compliance-category-card.tsx  # Category breakdown card
├── activity-feed.tsx             # Recent activity feed
├── pending-actions.tsx           # Pending suggestions list
├── dashboard-header.tsx          # Dashboard header
└── analytics-kpi-card.tsx        # Analytics KPI display
```

**Pages Already in Repo**:
```
src/app/
├── (auth)/dashboard/page.tsx     # Main dashboard
├── (auth)/products/[id]/page.tsx # Product detail
├── products/page.tsx             # Products list
├── products/bulk-optimize/page.tsx # Bulk operations
├── analytics/page.tsx            # Analytics page
└── approvals/page.tsx            # Approval queue
```

**shadcn/ui Components Available**:
- Badge, Button, Card, Table, Progress, Select, Input, etc.

---

## 🚀 Your Task: Phase 1C Frontend Integration

### **Step 1: Update Dashboard Page** (`src/app/(auth)/dashboard/page.tsx`)

**Replace Old Metrics** with optimization-focused KPIs:

```typescript
// Use trpc.analytics.dashboard.useQuery()
const { data: metrics } = trpc.analytics.dashboard.useQuery({
  workspaceId: workspace.id,
});

// Display these metrics in StatCard components:
{
  title: "Ready Products",
  value: metrics.ready_products,
  subtitle: `${(metrics.ready_products_pct * 100).toFixed(0)}% of catalog`,
  icon: "CheckCircle2",
  trend: metrics.ready_products_pct >= 0.8 ? "up" : "neutral"
}

{
  title: "Avg Optimization Score",
  value: metrics.avg_optimization_score,
  subtitle: `Level ${metrics.avg_optimization_level.toFixed(1)}/10`,
  icon: "TrendingUp"
}

{
  title: "Pending Actions",
  value: metrics.pending_suggestions,
  subtitle: "AI suggestions to review",
  icon: "AlertCircle",
  trend: metrics.pending_suggestions > 10 ? "down" : "neutral"
}

{
  title: "ChatGPT Revenue (30d)",
  value: formatPrice(metrics.last_30d_gmv),
  subtitle: `${metrics.last_30d_orders} orders`,
  icon: "DollarSign"
}
```

**Add Optimization Score Distribution Chart**:
- Show how many products are at each level (1-10)
- Use simple bar chart or stacked progress bar
- Highlight Level 8+ as "Ready" threshold

**Update PendingActions Component**:
- Show top 5 highest-impact suggestions
- Display score impact: `+8 points (L7 → L8)`
- Link to approval queue

---

### **Step 2: Update Products Table** (`src/components/products-table.tsx`)

**Fetch Products with Filters**:
```typescript
const { data, isLoading } = trpc.product.list.useQuery({
  workspaceId: workspace.id,
  status: filters.status,           // "ready" | "pending" | "missing"
  minLevel: filters.minLevel,       // 1-10
  maxLevel: filters.maxLevel,       // 1-10
  search: filters.search,           // Search query
  limit: 50,
  offset: page * 50,
});

// data returns:
{
  products: Product[],  // Array of products with optimizationScore, optimizationLevel, status
  total: number,        // Total count
  hasMore: boolean      // Pagination flag
}
```

**Table Columns to Display**:

| Column | Display | Notes |
|--------|---------|-------|
| **Product** | Image + Title | Truncate title to 50 chars |
| **Optimization** | `ComplianceIndicator` (10 dots) | Visual level display |
| **Level** | `Badge` with level (1-10) | Color: green (8+), yellow (6-7), red (<6) |
| **Status** | `ProductStatusBadge` | ready/pending/missing |
| **Stock** | `getStockStatus(inventoryQuantity)` | In Stock / Low Stock / Out of Stock |
| **Price** | `formatPrice(price, currency)` | $1,234.56 |
| **Actions** | View / Edit buttons | Link to product detail |

**Update ComplianceIndicator Component**:
```typescript
// src/components/compliance-indicator.tsx
interface Props {
  level: number;        // 1-10
  showLabel?: boolean;  // Show "Level 8/10"
}

// Display 10 dots:
// - Filled (green): level >= 8
// - Filled (yellow): level >= 6
// - Filled (red): level < 6
// - Empty (gray): unfilled dots
```

---

### **Step 3: Update Products Filter** (`src/components/products-filters.tsx`)

**Add Filter Controls**:

```typescript
// Status Filter (Select)
<Select value={filters.status} onChange={setStatus}>
  <option value="">All Statuses</option>
  <option value="ready">Ready (Level ≥8)</option>
  <option value="pending">Pending (Has Suggestions)</option>
  <option value="missing">Missing (Critical Issues)</option>
</Select>

// Optimization Level Range (Dual Range Slider or Select)
<div className="flex gap-2">
  <Select value={filters.minLevel} onChange={setMinLevel}>
    <option value="">Min Level</option>
    {[1,2,3,4,5,6,7,8,9,10].map(l => <option value={l}>Level {l}+</option>)}
  </Select>
  <Select value={filters.maxLevel} onChange={setMaxLevel}>
    <option value="">Max Level</option>
    {[1,2,3,4,5,6,7,8,9,10].map(l => <option value={l}>Level ≤{l}</option>)}
  </Select>
</div>

// Search Input
<Input
  placeholder="Search products..."
  value={filters.search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

---

### **Step 4: Build Product Detail Page** (`src/app/(auth)/products/[id]/page.tsx`)

**Fetch Product with Details**:
```typescript
const { data: product } = trpc.product.getById.useQuery({ id: params.id });

// product.scoreBreakdown structure:
{
  coreContent: 20,        // out of 25
  productIdentity: 18,    // out of 20
  agentFields: 15,        // out of 20 🤖
  mediaQuality: 12,       // out of 15
  commerceReadiness: 8,   // out of 10
  seoQuality: 4,          // out of 5
  reviews: 2,             // out of 3
  shipping: 1,            // out of 2
  total: 80,              // 0-100
  level: 9,               // 1-10
  missing: ["weight", "additionalImageLinks"]
}
```

**Display Layout**:

**Header Section** (`ProductDetailHeader`):
- Product title, image
- Optimization level badge (large)
- Overall score: "80/100 - Level 9 (Excellent)"
- Status badge
- Action buttons: Edit, Recalculate Score

**Score Breakdown Section** (`ComplianceCategoryCard` grid):

Display 8 category cards in 2x4 grid:

```typescript
// For each category in scoreBreakdown:
<ComplianceCategoryCard
  title={getCategoryName(category)}  // "Agent Context"
  icon={getCategoryIcon(category)}   // "Bot"
  score={scoreBreakdown[category]}   // 15
  maxScore={SCORE_WEIGHTS[category]} // 20
  percentage={(score / maxScore) * 100}
  status={percentage >= 80 ? "good" : percentage >= 60 ? "fair" : "poor"}
/>
```

**Category Card Details**:
- **Icon** (Lucide React icon)
- **Title** (e.g., "Agent Context")
- **Score**: "15 / 20 points"
- **Progress bar** (75% filled)
- **Status color**: Green (≥80%), Yellow (60-79%), Red (<60%)
- **Missing fields** (if any): Show which specific fields are missing

**Missing Fields Section**:
```typescript
{product.scoreBreakdown.missing.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Missing Fields</CardTitle>
      <CardDescription>
        Add these fields to improve your optimization score
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {product.scoreBreakdown.missing.map(field => (
          <li key={field} className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span>{field}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)}
```

**AI Suggestions Section**:
- Show pending suggestions for this product
- Display score impact for each suggestion
- Approve/reject buttons

---

### **Step 5: Update AI Suggestion Card** (`src/components/ai-suggestion-card.tsx`)

**Display Score Impact** (Critical Decision #3):

```typescript
interface AISuggestionCardProps {
  suggestion: {
    id: string;
    issueType: string;
    aiPayload: any;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    scoreImpact?: ScoreImpact;  // From backend
  };
  onApprove: () => void;
  onReject: () => void;
}

// Calculate score impact on the fly if not pre-calculated:
const { data: product } = trpc.product.getById.useQuery({ id: suggestion.productId });
const scoreImpact = useMemo(() => {
  if (suggestion.scoreImpact) return suggestion.scoreImpact;

  // Calculate locally
  const currentBreakdown = product.scoreBreakdown;
  // Apply suggestion changes hypothetically
  // Return impact
}, [product, suggestion]);

// Display:
<Card>
  <CardHeader>
    <div className="flex justify-between">
      <Badge variant={getStatusVariant(suggestion.riskLevel)}>
        {suggestion.riskLevel}
      </Badge>
      {scoreImpact && (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">
            {scoreImpact.points >= 0 ? '+' : ''}{scoreImpact.points} points
          </span>
          {scoreImpact.currentLevel !== scoreImpact.newLevel && (
            <Badge variant="outline">
              L{scoreImpact.currentLevel} → L{scoreImpact.newLevel}
            </Badge>
          )}
        </div>
      )}
    </div>
    <CardTitle>{getChangeType(suggestion.issueType)}</CardTitle>
    <CardDescription>{scoreImpact?.description}</CardDescription>
  </CardHeader>

  <CardContent>
    {/* Suggested changes from aiPayload */}
  </CardContent>

  <CardFooter>
    <Button onClick={onApprove}>Approve ({scoreImpact?.points >= 0 ? '+' : ''}{scoreImpact?.points} pts)</Button>
    <Button variant="outline" onClick={onReject}>Reject</Button>
  </CardFooter>
</Card>
```

**❌ DO NOT SHOW**:
- Business impact claims like "+15% discoverability"
- Revenue projections
- Conversion rate estimates
- Any metric we don't have 90+ days of data for

**✅ ONLY SHOW**:
- Score point deltas ("+8 points")
- Level changes ("Level 7 → 8")
- Category impact ("Product Identity +8")
- Specific field being added/improved

---

### **Step 6: Add Manual Edit Form with Live Score Preview**

**When editing a product** (`src/app/(auth)/products/[id]/edit/page.tsx` or modal):

```typescript
const [formData, setFormData] = useState(product);
const updateMutation = trpc.product.update.useMutation();

// Calculate hypothetical score as user types
const hypotheticalScore = useMemo(() => {
  return calculateOptimizationScore(formData);  // Import from @/lib/optimization
}, [formData]);

// Show live preview:
<Card className="sticky top-4">
  <CardHeader>
    <CardTitle>Score Preview</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span>Current Score</span>
          <span className="font-bold">{product.optimizationScore} pts (L{product.optimizationLevel})</span>
        </div>
        <Progress value={product.optimizationScore} max={100} />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span>New Score</span>
          <span className="font-bold text-green-600">
            {hypotheticalScore.total} pts (L{hypotheticalScore.level})
            {hypotheticalScore.total !== product.optimizationScore && (
              <span className="ml-2">
                ({hypotheticalScore.total > product.optimizationScore ? '+' : ''}
                {hypotheticalScore.total - product.optimizationScore})
              </span>
            )}
          </span>
        </div>
        <Progress value={hypotheticalScore.total} max={100} className="bg-green-100" />
      </div>

      {hypotheticalScore.level >= 8 && product.optimizationLevel < 8 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Ready for ChatGPT Shopping!</AlertTitle>
          <AlertDescription>
            This product will be marked as "ready" after saving.
          </AlertDescription>
        </Alert>
      )}
    </div>
  </CardContent>
</Card>

// On save:
await updateMutation.mutateAsync({
  id: product.id,
  data: formData,
});
// Backend automatically recalculates and updates score!
```

---

### **Step 7: Add Recalculate Score Button**

**On Product Detail Page**:

```typescript
const recalculateMutation = trpc.product.recalculateScore.useMutation({
  onSuccess: () => {
    toast.success("Score recalculated successfully");
    utils.product.getById.invalidate({ id: product.id });
  },
});

<Button
  variant="outline"
  onClick={() => recalculateMutation.mutate({ id: product.id })}
  disabled={recalculateMutation.isLoading}
>
  {recalculateMutation.isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Recalculating...
    </>
  ) : (
    <>
      <RefreshCw className="mr-2 h-4 w-4" />
      Recalculate Score
    </>
  )}
</Button>
```

**Use Case**: Manual refresh if merchant thinks score is outdated or after bulk changes.

---

### **Step 8: Update Analytics Page** (`src/app/analytics/page.tsx`)

**Add Optimization Metrics Section**:

```typescript
const { data: metrics } = trpc.analytics.dashboard.useQuery({ workspaceId });

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <AnalyticsKPICard
    title="Catalog Readiness"
    value={`${(metrics.ready_products_pct * 100).toFixed(0)}%`}
    description={`${metrics.ready_products} of ${metrics.total_products} products`}
    trend={metrics.ready_products_pct >= 0.8 ? "up" : "down"}
  />

  <AnalyticsKPICard
    title="Avg Optimization Score"
    value={metrics.avg_optimization_score}
    description={`Level ${metrics.avg_optimization_level.toFixed(1)}/10`}
    trend={metrics.avg_optimization_level >= 8 ? "up" : "neutral"}
  />

  <AnalyticsKPICard
    title="Products by Status"
    value={metrics.ready_products}
    description={`${metrics.pending_products} pending, ${metrics.missing_products} missing`}
  />

  <AnalyticsKPICard
    title="Checkout Enabled"
    value={`${(metrics.checkout_enabled_pct * 100).toFixed(0)}%`}
    description={`${metrics.checkout_enabled_count} products`}
  />
</div>
```

**Add Score Distribution Chart**:
- Bar chart or histogram showing products at each level (1-10)
- Highlight Level 8+ as "Ready" zone
- Use Recharts or Tremor

---

### **Step 9: Update Approval Queue** (`src/app/approvals/page.tsx`)

**Fetch Suggestions with Filters**:
```typescript
const { data: suggestions } = trpc.suggestion.list.useQuery({
  workspaceId,
  status: "PENDING",
  riskLevel: filters.riskLevel,  // LOW/MEDIUM/HIGH
  issueTypes: filters.issueTypes,
});
```

**Display**:
- List of `AISuggestionCard` components
- Show score impact for each
- Sort by highest impact first (optional)
- Bulk approve button for filtered suggestions

**Bulk Approve with Score Impact Summary**:
```typescript
const bulkApproveMutation = trpc.suggestion.bulkApproveByFilter.useMutation();

<Card>
  <CardHeader>
    <CardTitle>Bulk Approve</CardTitle>
    <CardDescription>
      Apply all {filteredCount} low-risk suggestions
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Estimated total impact: +{totalImpactPoints} points across {affectedProductCount} products</p>
  </CardContent>
  <CardFooter>
    <Button onClick={() => bulkApproveMutation.mutate({
      workspaceId,
      riskLevels: ["LOW"],
      issueTypes: selectedTypes,
    })}>
      Approve All Low-Risk
    </Button>
  </CardFooter>
</Card>
```

---

## 🎨 Design Guidelines

### Color System for Optimization Levels

```typescript
// Use these Tailwind classes (already in getLevelColor utility):
Level 10, 9: text-green-600, bg-green-50, border-green-200
Level 8, 7: text-green-500, bg-green-50, border-green-200
Level 6, 5: text-yellow-500, bg-yellow-50, border-yellow-200
Level 4-1: text-red-500, bg-red-50, border-red-200
```

### Badge Variants for Status

```typescript
// Use getStatusVariant utility:
"ready" → variant="default" (green)
"pending" → variant="secondary" (blue)
"missing" → variant="destructive" (red)
```

### Icons (Lucide React)

```typescript
// Use getCategoryIcon utility:
coreContent → "FileText"
productIdentity → "Tag"
agentFields → "Bot" 🤖
mediaQuality → "Image"
commerceReadiness → "ShoppingCart"
seoQuality → "Search"
reviews → "Star"
shipping → "Truck"
```

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] Dashboard loads with correct optimization metrics
- [ ] Products table shows optimization level and status correctly
- [ ] Filters work (status, level range, search)
- [ ] Pagination works correctly
- [ ] Product detail page shows score breakdown for all 8 categories
- [ ] Missing fields are displayed correctly
- [ ] AI suggestion cards show score impact (points + level change)
- [ ] Manual edit form shows live score preview
- [ ] Saving edits triggers automatic recalculation
- [ ] Recalculate button works and updates UI
- [ ] Applying suggestions recalculates product score
- [ ] Approval queue shows suggestions sorted by impact
- [ ] Bulk approve works and recalculates affected products
- [ ] Analytics page shows optimization metrics

### Edge Cases

- [ ] Product with score = 0 (all fields missing)
- [ ] Product with score = 100 (perfect)
- [ ] Product at Level 7.9 (just below ready threshold)
- [ ] Product at Level 8.0 (just at ready threshold)
- [ ] Product with no suggestions (should show "ready" if Level ≥8)
- [ ] Product with suggestions pending (should show "pending" even if Level ≥8)
- [ ] Suggestion that changes level (e.g., L7 → L8)
- [ ] Suggestion with 0 impact (no level change)
- [ ] Empty catalog (no products)
- [ ] Loading states for all queries
- [ ] Error states for failed mutations

### Visual Tests

- [ ] ComplianceIndicator dots render correctly (10 dots, filled/empty)
- [ ] Progress bars are accurate (score / 100)
- [ ] Colors match design system (green/yellow/red)
- [ ] Badges have correct variants
- [ ] Icons match categories
- [ ] Mobile responsive (all pages)
- [ ] Dark mode support (if applicable)

---

## 📝 Implementation Notes

### Import Paths

```typescript
// tRPC hooks
import { trpc } from '@/lib/trpc';

// Optimization utilities
import {
  getChangeType,
  getStockStatus,
  getLevelLabel,
  getLevelColor,
  getCategoryIcon,
  getCategoryName,
  formatPrice,
  timeAgo,
} from '@/lib/optimization/utils';

// TypeScript types
import type { ScoreBreakdown, ScoreImpact } from '@/lib/optimization/types';
import type { Product, Suggestion } from '@prisma/client';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
```

### Client-Side Score Calculation (Optional)

If you need to calculate scores on the client (e.g., for live preview):

```typescript
// You CAN import the server-side function in client components
// (it's pure TypeScript, no Prisma dependencies)
import { calculateOptimizationScore } from '@/lib/optimization/calculate-score';

// Use in useMemo for performance:
const hypotheticalScore = useMemo(() => {
  return calculateOptimizationScore(formData);
}, [formData]);
```

**Note**: This works because `calculate-score.ts` only depends on the Product type, not on Prisma client.

### Performance Considerations

- Use `useMemo` for score calculations
- Debounce search input (300ms)
- Paginate products table (50 per page)
- Use React Query (tRPC) caching
- Show skeleton loaders during fetch

### Error Handling

```typescript
const { data, isLoading, error } = trpc.product.list.useQuery({...});

if (error) {
  return <ErrorCard message={error.message} />;
}

if (isLoading) {
  return <ProductsTableSkeleton />;
}
```

---

## 🚀 Ready to Build?

### Quick Start Commands

```bash
# Ensure you're on the correct branch
git checkout claude/connect-github-repo-011CUcjanU7V7m4Gg96R6swK

# Pull latest backend changes
git pull origin claude/connect-github-repo-011CUcjanU7V7m4Gg96R6swK

# Install dependencies (if needed)
npm install

# Run database migration
npm run db:push

# Generate Prisma client
npm run db:generate

# Start dev server
npm run dev
```

### Build Order (Recommended)

1. **Start with Dashboard** - Low complexity, good overview
2. **Products Table** - Core functionality
3. **Product Detail Page** - Score breakdown display
4. **AI Suggestion Card** - Score impact display
5. **Edit Form with Live Preview** - Most complex
6. **Analytics Page** - Data visualization
7. **Approval Queue** - Bulk operations

---

## ✅ Definition of Done

Phase 1C is complete when:

- [ ] All dashboard metrics show optimization data
- [ ] Products table displays optimization level, status, and filters work
- [ ] Product detail page shows 8-category score breakdown
- [ ] AI suggestions display score impact (points + level change)
- [ ] Manual edits trigger automatic recalculation
- [ ] All components use backend utilities (getChangeType, formatPrice, etc.)
- [ ] No hardcoded business impact claims (only score impact)
- [ ] Mobile responsive
- [ ] All TypeScript types are correct (no `any`)
- [ ] Loading and error states are handled
- [ ] All tests pass

---

## 🎯 Success Metrics

After Phase 1C, merchants should be able to:

1. **See** their catalog optimization score at a glance
2. **Filter** products by optimization level and status
3. **Understand** exactly what fields are missing (8-category breakdown)
4. **Preview** score changes before applying suggestions
5. **Track** which products are "ready" for ChatGPT Shopping (Level ≥8)
6. **Prioritize** improvements based on score impact

---

## 📞 Questions?

If anything is unclear:

1. Check `src/lib/optimization/` for backend implementation details
2. Review `docs/CRITICAL-DECISIONS.md` for approved decisions
3. Review `docs/DECISION-MATRIX.md` for all non-critical decisions
4. Check `prisma/schema.prisma` for data model

**Remember**: The backend is 100% complete and tested. Your job is to make it beautiful and usable! 🎨

Good luck! 🚀
