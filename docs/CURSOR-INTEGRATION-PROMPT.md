# Cursor Integration Prompt: Connect Frontend to Backend

## Overview

You have two sets of code to integrate:

1. **v0-generated frontend components** (React/Next.js UI)
2. **Backend services and tRPC routers** (already implemented)

Your job is to wire them together so the UI calls the backend APIs correctly.

---

## Backend Services Available

### Feed Router (`src/server/routers/feed.ts`)

```typescript
// Available tRPC procedures:
feed.submit({ workspaceId, includeUnoptimized })
  → Returns: { success, submissionId, feedId, productCount, status }

feed.checkStatus({ submissionId })
  → Returns: { status, productsIndexed, productsTotal, lastUpdated }

feed.history({ workspaceId })
  → Returns: FeedSubmission[]

feed.stats({ workspaceId })
  → Returns: { total, eligible, missingGtinMpn, lowOptimization, searchEnabled, checkoutEnabled, lastSubmission }

feed.configureSync({ workspaceId, enabled, frequency })
  → Returns: { success }

feed.configureOpenAI({ workspaceId, merchantId, apiKey })
  → Returns: { success }

feed.getConfig({ workspaceId })
  → Returns: { feedSyncEnabled, feedSyncFrequency, lastFeedSyncAt, nextFeedSyncAt, openaiMerchantId, openaiApiKey }
```

### Product Router (Already exists, extend with toggles)

```typescript
// Add these mutations to src/server/routers/product.ts:

updateSearchToggle: protectedProcedure
  .input(z.object({ productId: z.string(), enabled: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.product.update({
      where: { id: input.productId },
      data: { enableSearch: input.enabled },
    });
  }),

updateCheckoutToggle: protectedProcedure
  .input(z.object({ productId: z.string(), enabled: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.product.update({
      where: { id: input.productId },
      data: { enableCheckout: input.enabled },
    });
  }),

bulkUpdateToggles: protectedProcedure
  .input(z.object({
    productIds: z.array(z.string()),
    enableSearch: z.boolean().optional(),
    enableCheckout: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { productIds, ...data } = input;
    return await ctx.db.product.updateMany({
      where: { id: { in: productIds } },
      data,
    });
  }),
```

---

## Integration Tasks

### Task 1: Feed Dashboard Page

**File:** `src/app/dashboard/[workspaceId]/feed/page.tsx`

**Steps:**

1. **Import tRPC client**
   ```typescript
   'use client';
   import { api } from '@/lib/trpc/client';
   ```

2. **Fetch feed stats and config**
   ```typescript
   const { data: stats, isLoading } = api.feed.stats.useQuery({
     workspaceId: params.workspaceId,
   });

   const { data: config } = api.feed.getConfig.useQuery({
     workspaceId: params.workspaceId,
   });

   const { data: history } = api.feed.history.useQuery({
     workspaceId: params.workspaceId,
   });
   ```

3. **Wire up submit button**
   ```typescript
   const submitMutation = api.feed.submit.useMutation({
     onSuccess: (data) => {
       toast.success(`Feed submitted! ${data.productCount} products`);
       // Refetch stats
       utils.feed.stats.invalidate();
       utils.feed.history.invalidate();
     },
     onError: (error) => {
       toast.error(error.message);
     },
   });

   const handleSubmitFeed = () => {
     submitMutation.mutate({
       workspaceId: params.workspaceId,
       includeUnoptimized: false,
     });
   };
   ```

4. **Wire up auto-refresh toggle**
   ```typescript
   const configureSyncMutation = api.feed.configureSync.useMutation({
     onSuccess: () => {
       toast.success('Auto-refresh configured');
       utils.feed.getConfig.invalidate();
     },
   });

   const handleFrequencyChange = (frequency: string) => {
     configureSyncMutation.mutate({
       workspaceId: params.workspaceId,
       enabled: true,
       frequency: frequency as any,
     });
   };
   ```

5. **Calculate status from stats**
   ```typescript
   const getStatus = (): 'live' | 'syncing' | 'not_live' => {
     if (!stats?.lastSubmission) return 'not_live';
     if (stats.lastSubmission.status === 'INDEXED') return 'live';
     if (['SUBMITTING', 'INDEXING'].includes(stats.lastSubmission.status)) {
       return 'syncing';
     }
     return 'not_live';
   };
   ```

6. **Add loading states**
   - While `isLoading`, show skeleton cards
   - During `submitMutation.isLoading`, disable button and show spinner
   - Use `shadcn/ui` Skeleton component

---

### Task 2: Feed Submission Modal

**File:** `src/components/feed/FeedSubmissionModal.tsx`

**Steps:**

1. **Fetch feed preview stats**
   ```typescript
   const { data: stats } = api.feed.stats.useQuery({ workspaceId });
   ```

2. **Show preview data**
   ```typescript
   <div className="space-y-2">
     <div className="flex items-center gap-2">
       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
       <span>{stats?.eligible || 0} products eligible</span>
     </div>
     <div className="flex items-center gap-2">
       <AlertCircle className="h-4 w-4 text-amber-500" />
       <span>{stats?.missingGtinMpn || 0} products missing GTIN/MPN</span>
     </div>
     <div className="flex items-center gap-2">
       <AlertCircle className="h-4 w-4 text-amber-500" />
       <span>{stats?.lowOptimization || 0} products low optimization</span>
     </div>
   </div>
   ```

3. **Submit handler**
   ```typescript
   const submitMutation = api.feed.submit.useMutation({
     onSuccess: () => {
       toast.success('Feed submitted successfully!');
       onClose();
     },
     onError: (error) => {
       toast.error(`Failed to submit: ${error.message}`);
     },
   });

   const handleSubmit = () => {
     submitMutation.mutate({
       workspaceId,
       includeUnoptimized: includeUnoptimizedState,
     });
   };
   ```

---

### Task 3: OpenAI Configuration Card

**File:** `src/components/feed/OpenAIConfigCard.tsx`

**Steps:**

1. **Load existing config**
   ```typescript
   const { data: config } = api.feed.getConfig.useQuery({ workspaceId });
   ```

2. **Pre-fill form**
   ```typescript
   useEffect(() => {
     if (config) {
       setMerchantId(config.openaiMerchantId || '');
       // apiKey is masked, don't pre-fill
     }
   }, [config]);
   ```

3. **Save handler**
   ```typescript
   const saveMutation = api.feed.configureOpenAI.useMutation({
     onSuccess: () => {
       toast.success('OpenAI credentials saved');
       utils.feed.getConfig.invalidate();
     },
     onError: (error) => {
       toast.error(`Failed to save: ${error.message}`);
     },
   });

   const handleSave = () => {
     saveMutation.mutate({
       workspaceId,
       merchantId,
       apiKey,
     });
   };
   ```

---

### Task 4: Products Table with Toggles

**File:** `src/app/dashboard/[workspaceId]/products/page.tsx`

**Steps:**

1. **Fetch products with filters**
   ```typescript
   const [searchQuery, setSearchQuery] = useState('');
   const [filterTab, setFilterTab] = useState<'all' | 'search_enabled' | 'checkout_enabled' | 'missing_gtin'>('all');

   const { data: productsData, isLoading } = api.product.list.useQuery({
     workspaceId: params.workspaceId,
     search: searchQuery,
     // Add these filters to product.list in backend
   });
   ```

2. **Extend product.list query** (in `src/server/routers/product.ts`)
   ```typescript
   list: protectedProcedure
     .input(
       z.object({
         workspaceId: z.string(),
         search: z.string().optional(),
         enableSearch: z.boolean().optional(),
         enableCheckout: z.boolean().optional(),
         missingGtin: z.boolean().optional(),
         limit: z.number().default(50),
         offset: z.number().default(0),
       })
     )
     .query(async ({ ctx, input }) => {
       const where: any = { workspaceId: input.workspaceId };

       if (input.search) {
         where.title = { contains: input.search, mode: 'insensitive' };
       }

       if (input.enableSearch !== undefined) {
         where.enableSearch = input.enableSearch;
       }

       if (input.enableCheckout !== undefined) {
         where.enableCheckout = input.enableCheckout;
       }

       if (input.missingGtin) {
         where.AND = [{ gtin: null }, { mpn: null }];
       }

       const [products, totalCount] = await Promise.all([
         ctx.db.product.findMany({
           where,
           take: input.limit,
           skip: input.offset,
           orderBy: { createdAt: 'desc' },
         }),
         ctx.db.product.count({ where }),
       ]);

       return { products, totalCount };
     }),
   ```

3. **Wire up search toggle**
   ```typescript
   const toggleSearchMutation = api.product.updateSearchToggle.useMutation({
     onMutate: async ({ productId, enabled }) => {
       // Optimistic update
       await utils.product.list.cancel();
       const previousData = utils.product.list.getData();

       utils.product.list.setData(
         { workspaceId: params.workspaceId },
         (old) => {
           if (!old) return old;
           return {
             ...old,
             products: old.products.map((p) =>
               p.id === productId ? { ...p, enableSearch: enabled } : p
             ),
           };
         }
       );

       return { previousData };
     },
     onError: (err, variables, context) => {
       // Revert on error
       if (context?.previousData) {
         utils.product.list.setData(
           { workspaceId: params.workspaceId },
           context.previousData
         );
       }
       toast.error('Failed to update product');
     },
     onSuccess: () => {
       toast.success('Product updated');
     },
   });

   const handleToggleSearch = (productId: string, enabled: boolean) => {
     toggleSearchMutation.mutate({ productId, enabled });
   };
   ```

4. **Wire up checkout toggle** (same pattern as search)

5. **Wire up bulk actions**
   ```typescript
   const bulkMutation = api.product.bulkUpdateToggles.useMutation({
     onSuccess: (data) => {
       toast.success(`Updated ${data.count} products`);
       utils.product.list.invalidate();
       setSelectedIds([]);
     },
   });

   const handleBulkAction = (action: 'enable_search' | 'disable_search' | 'enable_checkout' | 'disable_checkout') => {
     const updates: any = {};

     if (action === 'enable_search') updates.enableSearch = true;
     if (action === 'disable_search') updates.enableSearch = false;
     if (action === 'enable_checkout') updates.enableCheckout = true;
     if (action === 'disable_checkout') updates.enableCheckout = false;

     bulkMutation.mutate({
       productIds: selectedIds,
       ...updates,
     });
   };
   ```

---

### Task 5: Add Product Router Mutations

**File:** `src/server/routers/product.ts`

Add these three mutations to the existing productRouter:

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const productRouter = router({
  // ... existing procedures (list, getById, sync, etc.)

  // NEW: Update search toggle
  updateSearchToggle: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify product belongs to user's workspace
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId },
        include: { workspace: true },
      });

      if (!product || product.workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Product not found');
      }

      return await ctx.db.product.update({
        where: { id: input.productId },
        data: { enableSearch: input.enabled },
      });
    }),

  // NEW: Update checkout toggle
  updateCheckoutToggle: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId },
        include: { workspace: true },
      });

      if (!product || product.workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Product not found');
      }

      return await ctx.db.product.update({
        where: { id: input.productId },
        data: { enableCheckout: input.enabled },
      });
    }),

  // NEW: Bulk update toggles
  bulkUpdateToggles: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        productIds: z.array(z.string()),
        enableSearch: z.boolean().optional(),
        enableCheckout: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      const { productIds, workspaceId, ...updates } = input;

      // Only update products in this workspace
      return await ctx.db.product.updateMany({
        where: {
          id: { in: productIds },
          workspaceId: workspaceId,
        },
        data: updates,
      });
    }),
});
```

---

## UI Polish Tasks

### 1. Loading States

- Use `shadcn/ui` Skeleton components while data loads
- Show spinners on mutation buttons
- Add loading overlay for bulk actions

```typescript
{isLoading ? (
  <Skeleton className="h-32 w-full" />
) : (
  <StatusCard data={stats} />
)}
```

### 2. Error Boundaries

- Wrap pages in error boundaries
- Show friendly error messages
- Add retry buttons

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold text-slate-50">Something went wrong</h2>
      <p className="text-slate-400 mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  );
}
```

### 3. Toast Notifications

- Use `sonner` for all success/error toasts
- Consistent messaging:
  - Success: "Feed submitted successfully!"
  - Error: "Failed to submit: [reason]"
  - Loading: "Submitting feed..." (auto-dismiss on complete)

```typescript
import { toast } from 'sonner';

// In your mutation:
onSuccess: () => {
  toast.success('Feed submitted!', {
    description: `${data.productCount} products indexed`,
  });
},
```

### 4. Optimistic Updates

- For toggle switches, update UI immediately (don't wait for server)
- Revert on error
- Use tRPC's `onMutate` callback

---

## Database Migration

Before testing, run:

```bash
cd /home/user/Agentic-Commerce-Optimization
npm run db:push  # Push schema changes to database
npm run db:generate  # Regenerate Prisma client
```

---

## Testing Checklist

- [ ] Feed dashboard loads stats correctly
- [ ] Submit feed button works (success/error states)
- [ ] Auto-refresh toggle saves to database
- [ ] Recent submissions table populates
- [ ] OpenAI config form saves credentials
- [ ] Products table loads with search/filter
- [ ] Search toggle updates instantly (optimistic)
- [ ] Checkout toggle updates instantly (optimistic)
- [ ] Bulk actions work for selected products
- [ ] Pagination works
- [ ] Mobile responsive layouts work
- [ ] Toast notifications appear correctly
- [ ] Loading skeletons show while fetching

---

## Security Notes

**API Key Storage:**
- Current implementation stores OpenAI API key in plaintext
- **TODO for production:** Encrypt API keys before storing
  - Use library like `crypto-js` or server-side encryption
  - Store encrypted value in database
  - Decrypt only when making API calls

**Authorization:**
- All mutations check workspace ownership
- Product updates verify workspace ownership
- Users can only access their own workspaces

---

## Final Steps

1. Run database migration: `npm run db:push`
2. Start dev server: `npm run dev`
3. Create a test workspace
4. Connect Shopify (if not already done)
5. Navigate to `/dashboard/[workspaceId]/feed`
6. Test all features end-to-end

---

## Common Issues & Solutions

**Issue: tRPC hooks return undefined**
- Solution: Ensure `api` is imported from correct path
- Check `src/lib/trpc/client.ts` exports

**Issue: Mutations don't invalidate queries**
- Solution: Use `utils.feed.stats.invalidate()` after mutations
- Import `utils` from `api.useContext()`

**Issue: Optimistic updates don't work**
- Solution: Ensure `onMutate` returns previous data
- Use `setData` not `setQueryData`

**Issue: TypeScript errors on tRPC types**
- Solution: Run `npm run db:generate` to regenerate Prisma types
- Restart TypeScript server in VSCode

---

## Next Phase: Scheduled Jobs

After frontend is working, implement the scheduled feed refresh job:

**File:** `src/lib/jobs/feed-refresh-scheduler.ts`

This will run every 15 minutes, check which workspaces need sync, and call `submitProductFeed()` automatically.

See Phase 2 documentation for implementation details.
