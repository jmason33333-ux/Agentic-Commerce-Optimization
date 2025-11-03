# 🎯 Cursor: Phase 1C Frontend Integration

## Your Mission

Build the frontend UI for the **Optimization Scoring System** for the Agent Commerce SEO product.

## 📋 What You Need to Know

**Backend is 100% COMPLETE** ✅
- Optimization scoring system (8 categories, 100 points → Level 1-10)
- All tRPC endpoints ready
- Auto-recalculation on edits, syncs, and suggestion approvals
- Score impact calculation (show point deltas, NOT business claims)

## 📖 Read This First

**CRITICAL**: Read the comprehensive implementation guide:
```
docs/CURSOR-PHASE-1C-PROMPT.md
```

This 880-line document contains:
- Complete backend code review
- All 8 scoring categories explained
- Exact component specifications
- Code examples for every feature
- Testing checklist
- Design guidelines

## 🔑 Key Backend Files to Review

```
src/lib/optimization/
├── types.ts                # TypeScript interfaces and constants
├── calculate-score.ts      # 8-category scoring logic
├── calculate-impact.ts     # Score impact calculation
├── utils.ts                # Helper functions (formatPrice, getLevelColor, etc.)
└── index.ts                # Centralized exports

src/server/routers/
├── product.ts              # product.list, update, recalculateScore
├── analytics.ts            # analytics.dashboard metrics
└── suggestion.ts           # suggestion.apply (with score recalc)
```

## 🎨 What You're Building

### 1. Dashboard Page
- Optimization metrics (ready products, avg score, pending actions)
- Score distribution chart
- Updated StatCard components

### 2. Products Table
- Display optimization level (1-10) with ComplianceIndicator (10 dots)
- Status badges (ready/pending/missing)
- Filters: status, level range, search

### 3. Product Detail Page
- Overall score display
- 8-category breakdown cards (Core Content, Product Identity, **Agent Fields**, etc.)
- Missing fields list
- Recalculate button

### 4. AI Suggestion Cards
- **Score impact display** (e.g., "+8 points (L7 → L8)")
- ❌ NO business claims ("+15% discoverability")
- ✅ ONLY score deltas and level changes

### 5. Edit Form with Live Preview
- Real-time score calculation as user types
- Show current vs. new score
- "Ready for ChatGPT Shopping!" alert when reaching Level 8

### 6. Analytics Page
- Catalog readiness percentage
- Score distribution metrics
- Checkout enabled stats

## 🚀 Quick Start

```bash
# Ensure you're on the correct branch
git checkout claude/connect-github-repo-011CUcjanU7V7m4Gg96R6swK

# Pull latest (includes backend + this prompt)
git pull origin claude/connect-github-repo-011CUcjanU7V7m4Gg96R6swK

# Setup database
npm run db:push
npm run db:generate

# Start dev server
npm run dev
```

## 🎯 Critical Rules

### ✅ DO:
- Use backend utility functions (`getLevelColor`, `formatPrice`, `timeAgo`, etc.)
- Show score impact ("+8 points", "Level 7 → 8")
- Display 8-category breakdown on product detail
- Use ComplianceIndicator for 10-dot visual
- Implement filters (status, level, search)
- Show loading and error states

### ❌ DON'T:
- Show business impact claims ("+15% discoverability", "revenue increase")
- Hardcode scoring logic (use backend calculations)
- Use `any` types (use proper TypeScript types)
- Skip mobile responsive design
- Forget to handle edge cases (empty states, level boundaries)

## 🧪 Test These Scenarios

1. Product with score 0 (all missing)
2. Product with score 100 (perfect)
3. Product at Level 7.9 (just below ready)
4. Product at Level 8.0 (just at ready)
5. Suggestion that changes level (L7 → L8)
6. Empty catalog
7. Mobile view

## 📊 The Optimization Score System (Quick Ref)

**8 Categories (100 points total)**:
1. Core Content (25pts) - Title & description
2. Product Identity (20pts) - GTIN, brand, category
3. **Agent Fields (20pts)** 🤖 - Use cases, target audience, comparisons
4. Media Quality (15pts) - Images, video
5. Commerce Readiness (10pts) - Price, inventory
6. SEO Quality (5pts) - Links, structured data
7. Reviews (3pts) - Social proof
8. Shipping (2pts) - Delivery info

**Levels**:
- Level 10: 90-100 (Perfect)
- Level 9: 80-89 (Excellent)
- **Level 8: 70-79 (Ready)** ← Minimum for ChatGPT Shopping
- Level 7: 60-69 (Good)
- Level 6-1: <60 (Needs work)

**Status**:
- `ready` = Level ≥8 AND no pending suggestions
- `pending` = Has pending suggestions
- `missing` = Level <5 OR critical fields missing

## 🎨 Components Already Available

**v0 Components** (in `src/components/`):
- `stat-card.tsx` - Dashboard stats
- `compliance-indicator.tsx` - 10-dot visual (UPDATE THIS!)
- `product-status-badge.tsx` - Status badges
- `ai-suggestion-card.tsx` - Suggestion display (UPDATE THIS!)
- `products-table.tsx` - Products list (UPDATE THIS!)
- `product-detail-header.tsx` - Product header
- `compliance-category-card.tsx` - Category breakdown
- `analytics-kpi-card.tsx` - KPI display

**Pages** (in `src/app/`):
- `(auth)/dashboard/page.tsx` - Main dashboard (UPDATE THIS!)
- `(auth)/products/[id]/page.tsx` - Product detail (UPDATE THIS!)
- `products/page.tsx` - Products list
- `approvals/page.tsx` - Approval queue
- `analytics/page.tsx` - Analytics (UPDATE THIS!)

## 📦 Available Utilities

```typescript
// Import these from @/lib/optimization/utils
import {
  getChangeType,        // issueType → "title" | "field" | "description"
  getStockStatus,       // inventory → "In Stock" | "Low Stock" | "Out of Stock"
  getLevelLabel,        // level → "Perfect" | "Excellent" | "Ready" etc.
  getLevelColor,        // level → Tailwind color class
  formatPrice,          // price → "$1,234.56"
  formatPercentage,     // 15.5 → "+15.5%"
  timeAgo,              // Date → "2h ago"
  getCategoryIcon,      // category → Lucide icon name
  getCategoryName,      // category → "Agent Context"
} from '@/lib/optimization/utils';

// Types
import type { ScoreBreakdown, ScoreImpact } from '@/lib/optimization/types';
```

## 🎯 Build Order (Recommended)

1. **Dashboard** - Start here (easiest)
2. **Products Table** - Core functionality
3. **Product Detail** - Score breakdown
4. **Suggestion Cards** - Score impact
5. **Edit Form** - Live preview (most complex)
6. **Analytics** - Charts and metrics
7. **Approval Queue** - Bulk operations

## ✅ Definition of Done

Phase 1C is complete when:
- ✅ Dashboard shows optimization metrics
- ✅ Products table has filters and displays levels/status
- ✅ Product detail shows 8-category breakdown
- ✅ Suggestions show score impact (points + levels)
- ✅ Edit form has live score preview
- ✅ All components use backend utilities
- ✅ Mobile responsive
- ✅ No TypeScript errors
- ✅ Loading/error states handled

## 📞 Need Help?

1. Read `docs/CURSOR-PHASE-1C-PROMPT.md` (comprehensive guide)
2. Check backend code in `src/lib/optimization/`
3. Review `docs/CRITICAL-DECISIONS.md` for context
4. Check `prisma/schema.prisma` for data model

---

**Remember**: The backend is done. Your job is to make it beautiful and usable! 🎨

**Start with**: `docs/CURSOR-PHASE-1C-PROMPT.md`

Good luck! 🚀
