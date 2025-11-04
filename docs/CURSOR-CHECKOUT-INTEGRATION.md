# Cursor Integration: Agentic Checkout Setup

## Overview

This guide wires the checkout wizard UI (from v0) to the backend checkout services.

**Backend Available:**
- ✅ Stripe service with Checkout Session creation
- ✅ OpenAI checkout registration client
- ✅ Webhook handlers (Stripe → order updates)
- ✅ tRPC router with 10 checkout endpoints
- ✅ Database models (CheckoutSession, Order)

**Frontend to Build:**
- Checkout wizard (4 steps)
- Orders dashboard
- Order detail modal

---

## Backend API Reference

### tRPC Checkout Router

```typescript
// Available endpoints:
checkout.getConfig({ workspaceId })
  → Returns: CheckoutConfig | null

checkout.configureStripe({ workspaceId, publishableKey, secretKey, webhookSecret? })
  → Returns: { success, configId }

checkout.configureUrls({ workspaceId, checkoutUrl, webhookUrl? })
  → Returns: { success }

checkout.registerWithOpenAI({ workspaceId, supportedCountries? })
  → Returns: { success, checkoutId, status, verificationRequired, verificationUrl? }

checkout.testCheckout({ workspaceId })
  → Returns: { success, errors?, responseTime }

checkout.getStatus({ workspaceId })
  → Returns: { registered, status, lastVerified, verificationRequired, issues? }

checkout.getSessions({ workspaceId, limit?, offset?, status? })
  → Returns: { sessions[], totalCount }

checkout.getOrders({ workspaceId, limit?, offset?, status? })
  → Returns: { orders[], totalCount }

checkout.updateOrder({ orderId, status, trackingNumber?, notes? })
  → Returns: Order
```

---

## Integration Tasks

### Task 1: Checkout Wizard Page

**File:** `src/app/dashboard/[workspaceId]/checkout/page.tsx`

**Steps:**

1. **Set up wizard state**
   ```typescript
   'use client';
   import { useState } from 'react';
   import { api } from '@/lib/trpc/client';

   type WizardStep = 'stripe' | 'urls' | 'register' | 'test';

   const [currentStep, setCurrentStep] = useState<WizardStep>('stripe');
   const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
   ```

2. **Load existing config**
   ```typescript
   const { data: config, isLoading } = api.checkout.getConfig.useQuery({
     workspaceId: params.workspaceId,
   });

   // Determine starting step based on config
   useEffect(() => {
     if (!config) {
       setCurrentStep('stripe');
     } else if (!config.openaiCheckoutId) {
       setCurrentStep('register');
     } else {
       setCurrentStep('test');
     }
   }, [config]);
   ```

3. **Render current step component**
   ```typescript
   {currentStep === 'stripe' && (
     <StripeConnection
       workspaceId={params.workspaceId}
       onComplete={() => {
         setCompletedSteps([...completedSteps, 'stripe']);
         setCurrentStep('urls');
       }}
     />
   )}
   {currentStep === 'urls' && (
     <CheckoutUrls
       workspaceId={params.workspaceId}
       config={config}
       onComplete={() => {
         setCompletedSteps([...completedSteps, 'urls']);
         setCurrentStep('register');
       }}
     />
   )}
   // ... other steps
   ```

---

### Task 2: Step 1 - Stripe Connection Component

**File:** `src/components/checkout/steps/StripeConnection.tsx`

**Steps:**

1. **Form state**
   ```typescript
   const [publishableKey, setPublishableKey] = useState('');
   const [secretKey, setSecretKey] = useState('');
   const [webhookSecret, setWebhookSecret] = useState('');
   const [isTestMode, setIsTestMode] = useState(true);
   ```

2. **Validation logic**
   ```typescript
   const validate = () => {
     const errors: string[] = [];

     if (!publishableKey.startsWith('pk_')) {
       errors.push('Publishable key must start with pk_');
     }

     if (!secretKey.startsWith('sk_')) {
       errors.push('Secret key must start with sk_');
     }

     // Check if both are test or both are live
     const pkMode = publishableKey.includes('_test_') ? 'test' : 'live';
     const skMode = secretKey.includes('_test_') ? 'test' : 'live';

     if (pkMode !== skMode) {
       errors.push('Keys must both be test or both be live');
     }

     return errors;
   };
   ```

3. **Configure Stripe mutation**
   ```typescript
   const configureStripeMutation = api.checkout.configureStripe.useMutation({
     onSuccess: () => {
       toast.success('Stripe configured successfully!');
       onComplete(); // Move to next step
     },
     onError: (error) => {
       toast.error(`Failed to configure Stripe: ${error.message}`);
     },
   });

   const handleSubmit = async () => {
     const errors = validate();
     if (errors.length > 0) {
       toast.error(errors[0]);
       return;
     }

     configureStripeMutation.mutate({
       workspaceId,
       publishableKey,
       secretKey,
       webhookSecret: webhookSecret || undefined,
     });
   };
   ```

4. **Show/hide password toggles**
   ```typescript
   const [showSecretKey, setShowSecretKey] = useState(false);
   const [showWebhookSecret, setShowWebhookSecret] = useState(false);

   <Input
     type={showSecretKey ? 'text' : 'password'}
     value={secretKey}
     onChange={(e) => setSecretKey(e.target.value)}
   />
   <Button
     variant="ghost"
     size="sm"
     onClick={() => setShowSecretKey(!showSecretKey)}
   >
     {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
   </Button>
   ```

---

### Task 3: Step 2 - Checkout URLs Component

**File:** `src/components/checkout/steps/CheckoutUrls.tsx`

**Steps:**

1. **Generate URLs**
   ```typescript
   const checkoutUrl = `${window.location.origin}/api/checkout/${workspaceId}`;
   const webhookUrl = `${window.location.origin}/api/webhooks/stripe/${workspaceId}`;
   ```

2. **Copy to clipboard**
   ```typescript
   const copyToClipboard = async (text: string, label: string) => {
     await navigator.clipboard.writeText(text);
     toast.success(`${label} copied to clipboard!`);
   };
   ```

3. **Save URLs mutation**
   ```typescript
   const configureUrlsMutation = api.checkout.configureUrls.useMutation({
     onSuccess: () => {
       toast.success('URLs configured!');
       onComplete();
     },
   });

   const handleContinue = () => {
     configureUrlsMutation.mutate({
       workspaceId,
       checkoutUrl,
       webhookUrl,
     });
   };
   ```

4. **Setup checklist**
   ```typescript
   const [checklist, setChecklist] = useState({
     copiedUrl: false,
     addedWebhook: false,
     selectedEvents: false,
   });

   // Checkbox components that update checklist state
   // "Continue" button enabled only when all checked
   const allComplete = Object.values(checklist).every(Boolean);
   ```

---

### Task 4: Step 3 - OpenAI Registration Component

**File:** `src/components/checkout/steps/OpenAIRegistration.tsx`

**Steps:**

1. **Load workspace info**
   ```typescript
   const { data: workspace } = api.workspace.getById.useQuery({
     id: workspaceId,
   });

   // Show merchant ID, API key status
   const hasMerchantId = Boolean(workspace?.openaiMerchantId);
   const hasApiKey = Boolean(workspace?.openaiApiKey);
   ```

2. **Country selector**
   ```typescript
   import { Combobox } from '@/components/ui/combobox';

   const countries = [
     { value: 'US', label: '🇺🇸 United States', flag: '🇺🇸' },
     { value: 'CA', label: '🇨🇦 Canada', flag: '🇨🇦' },
     { value: 'GB', label: '🇬🇧 United Kingdom', flag: '🇬🇧' },
     { value: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺' },
   ];

   const [selectedCountries, setSelectedCountries] = useState(['US', 'CA', 'GB', 'AU']);
   ```

3. **Register mutation**
   ```typescript
   const registerMutation = api.checkout.registerWithOpenAI.useMutation({
     onSuccess: (data) => {
       toast.success('Registered with OpenAI!');

       if (data.verificationRequired) {
         // Show verification URL
         toast.info('Verification required - check your email');
       }

       onComplete();
     },
     onError: (error) => {
       toast.error(`Registration failed: ${error.message}`);
     },
   });

   const handleRegister = () => {
     if (!hasMerchantId || !hasApiKey) {
       toast.error('Please configure OpenAI credentials in workspace settings');
       return;
     }

     registerMutation.mutate({
       workspaceId,
       supportedCountries: selectedCountries,
     });
   };
   ```

---

### Task 5: Step 4 - Test & Verify Component

**File:** `src/components/checkout/steps/TestCheckout.tsx`

**Steps:**

1. **Load checkout status**
   ```typescript
   const { data: status, refetch } = api.checkout.getStatus.useQuery({
     workspaceId,
   });

   // Display status badge
   const getStatusBadge = () => {
     if (!status?.registered) return { color: 'gray', label: 'Not Registered' };
     if (status.status === 'active') return { color: 'green', label: 'Active' };
     if (status.status === 'pending') return { color: 'yellow', label: 'Pending' };
     return { color: 'red', label: 'Suspended' };
   };
   ```

2. **Run tests**
   ```typescript
   const testMutation = api.checkout.testCheckout.useMutation({
     onSuccess: (result) => {
       if (result.success) {
         toast.success(`All tests passed! (${result.responseTime}ms)`);
       } else {
         toast.error('Some tests failed');
       }
       setTestResults(result);
     },
   });

   const [testResults, setTestResults] = useState<any>(null);

   const runTests = () => {
     testMutation.mutate({ workspaceId });
   };
   ```

3. **Test results display**
   ```typescript
   {testResults && (
     <div className="space-y-2">
       <TestResult
         passed={testResults.success}
         label="Checkout endpoint responding"
         time={testResults.responseTime}
       />
       {testResults.errors?.map((error, i) => (
         <TestResult
           key={i}
           passed={false}
           label={error}
         />
       ))}
     </div>
   )}
   ```

4. **Completion actions**
   ```typescript
   <div className="flex gap-4">
     <Button onClick={() => router.push(`/dashboard/${workspaceId}/products`)}>
       Go to Products
     </Button>
     <Button onClick={() => router.push(`/dashboard/${workspaceId}/orders`)}>
       View Orders Dashboard
     </Button>
   </div>
   ```

---

### Task 6: Orders Dashboard Page

**File:** `src/app/dashboard/[workspaceId]/orders/page.tsx`

**Steps:**

1. **Load orders with filters**
   ```typescript
   const [statusFilter, setStatusFilter] = useState<any>(undefined);
   const [searchQuery, setSearchQuery] = useState('');

   const { data: ordersData, isLoading } = api.checkout.getOrders.useQuery({
     workspaceId: params.workspaceId,
     status: statusFilter,
     limit: 50,
     offset: 0,
   });
   ```

2. **Orders table**
   ```typescript
   <Table>
     <TableHeader>
       <TableRow>
         <TableHead>Order #</TableHead>
         <TableHead>Customer</TableHead>
         <TableHead>Amount</TableHead>
         <TableHead>Status</TableHead>
         <TableHead>Date</TableHead>
       </TableRow>
     </TableHeader>
     <TableBody>
       {ordersData?.orders.map((order) => (
         <TableRow
           key={order.id}
           className="cursor-pointer hover:bg-slate-700/50"
           onClick={() => setSelectedOrder(order)}
         >
           <TableCell>{order.orderNumber}</TableCell>
           <TableCell>
             <div>{order.customerEmail}</div>
             <div className="text-sm text-slate-400">
               {order.checkoutSession.cartData.length} items
             </div>
           </TableCell>
           <TableCell>
             ${order.totalAmount} {order.currency}
           </TableCell>
           <TableCell>
             <OrderStatusBadge status={order.status} />
           </TableCell>
           <TableCell>
             {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
           </TableCell>
         </TableRow>
       ))}
     </TableBody>
   </Table>
   ```

3. **Status filter tabs**
   ```typescript
   <Tabs value={statusFilter} onValueChange={setStatusFilter}>
     <TabsList>
       <TabsTrigger value={undefined}>All</TabsTrigger>
       <TabsTrigger value="PAID">Paid</TabsTrigger>
       <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
       <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
       <TabsTrigger value="PENDING_FULFILLMENT">Pending</TabsTrigger>
     </TabsList>
   </Tabs>
   ```

4. **Empty state**
   ```typescript
   {ordersData?.orders.length === 0 && (
     <div className="flex flex-col items-center justify-center py-12">
       <Package className="h-12 w-12 text-slate-600 mb-4" />
       <h3 className="text-lg font-semibold text-slate-50">No orders yet</h3>
       <p className="text-slate-400 text-sm">
         Orders will appear here once customers purchase through ChatGPT
       </p>
     </div>
   )}
   ```

---

### Task 7: Order Detail Modal

**File:** `src/components/orders/OrderDetailModal.tsx`

**Steps:**

1. **Modal structure**
   ```typescript
   import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

   <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
     <DialogContent className="max-w-2xl">
       <DialogHeader>
         <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
       </DialogHeader>

       {/* Modal content */}
     </DialogContent>
   </Dialog>
   ```

2. **Order details**
   ```typescript
   <div className="space-y-6">
     {/* Status */}
     <div className="flex items-center gap-2">
       <OrderStatusBadge status={order.status} />
       {order.trackingNumber && (
         <a
           href={`https://track.example.com/${order.trackingNumber}`}
           target="_blank"
           className="text-sm text-violet-400 hover:underline"
         >
           Track Package →
         </a>
       )}
     </div>

     {/* Customer */}
     <div className="bg-slate-700 p-4 rounded-lg">
       <h4 className="text-sm font-semibold mb-2">Customer</h4>
       <p>{order.customerEmail}</p>
       {order.shippingAddress && (
         <p className="text-sm text-slate-400 mt-1">
           {formatAddress(order.shippingAddress)}
         </p>
       )}
     </div>

     {/* Items */}
     <div>
       <h4 className="text-sm font-semibold mb-2">Items</h4>
       {order.checkoutSession.cartData.map((item: any) => (
         <div key={item.productId} className="flex justify-between py-2">
           <span>{item.title} × {item.quantity}</span>
           <span>${item.price}</span>
         </div>
       ))}
       <div className="border-t border-slate-600 mt-2 pt-2">
         <div className="flex justify-between font-semibold">
           <span>Total</span>
           <span>${order.totalAmount} {order.currency}</span>
         </div>
       </div>
     </div>
   </div>
   ```

3. **Update order form**
   ```typescript
   const updateOrderMutation = api.checkout.updateOrder.useMutation({
     onSuccess: () => {
       toast.success('Order updated');
       utils.checkout.getOrders.invalidate();
       setSelectedOrder(null);
     },
   });

   const [newStatus, setNewStatus] = useState(order.status);
   const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

   const handleUpdate = () => {
     updateOrderMutation.mutate({
       orderId: order.id,
       status: newStatus,
       trackingNumber,
     });
   };
   ```

4. **Timeline**
   ```typescript
   <div className="space-y-2">
     <h4 className="text-sm font-semibold">Timeline</h4>
     {order.deliveredAt && (
       <TimelineItem
         label="Delivered"
         time={order.deliveredAt}
       />
     )}
     {order.shippedAt && (
       <TimelineItem
         label="Shipped"
         time={order.shippedAt}
       />
     )}
     <TimelineItem
       label="Paid"
       time={order.createdAt}
     />
   </div>
   ```

---

## Helper Components

### Order Status Badge

**File:** `src/components/orders/OrderStatusBadge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  PAID: { color: 'yellow', label: 'Paid', icon: '🟡' },
  PROCESSING: { color: 'blue', label: 'Processing', icon: '🔵' },
  SHIPPED: { color: 'green', label: 'Shipped', icon: '🟢' },
  DELIVERED: { color: 'green', label: 'Delivered', icon: '🟢' },
  PENDING_FULFILLMENT: { color: 'yellow', label: 'Pending', icon: '🟡' },
  CANCELLED: { color: 'red', label: 'Cancelled', icon: '🔴' },
  REFUNDED: { color: 'red', label: 'Refunded', icon: '🔴' },
  PAYMENT_FAILED: { color: 'red', label: 'Failed', icon: '🔴' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge variant={config.color as any}>
      {config.icon} {config.label}
    </Badge>
  );
}
```

---

## Environment Variables

Add to `.env`:

```env
# Encryption for API keys
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# App URL (for generating checkout URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or your production URL
```

Generate encryption key:
```bash
openssl rand -hex 32
```

---

## Database Migration

Before testing, run:

```bash
cd /home/user/Agentic-Commerce-Optimization
npm run db:push  # Push schema changes
npm run db:generate  # Regenerate Prisma client
```

---

## Testing Checklist

### Stripe Configuration
- [ ] Can enter Stripe keys
- [ ] Validation works (catches wrong key format)
- [ ] Show/hide password toggles work
- [ ] Test mode checkbox works
- [ ] Successfully saves to database
- [ ] Moves to next step on success

### URLs Configuration
- [ ] Checkout URL generates correctly
- [ ] Webhook URL generates correctly
- [ ] Copy buttons work (toast shows)
- [ ] Checklist updates
- [ ] Continue button enabled when all checked

### OpenAI Registration
- [ ] Shows merchant ID and API key status
- [ ] Country selector works (multi-select)
- [ ] Registration succeeds
- [ ] Shows verification URL if required
- [ ] Moves to test step

### Test & Verify
- [ ] Status loads and displays correctly
- [ ] Test button runs all checks
- [ ] Test results show with checkmarks/X marks
- [ ] Response time displays
- [ ] Next steps links work

### Orders Dashboard
- [ ] Orders load and display
- [ ] Search works
- [ ] Status filter tabs work
- [ ] Clicking order opens detail modal
- [ ] Pagination works
- [ ] Empty state shows when no orders

### Order Detail
- [ ] Order details display correctly
- [ ] Customer info shows
- [ ] Items list and totals correct
- [ ] Status update dropdown works
- [ ] Tracking number input works
- [ ] Update button saves changes
- [ ] Timeline shows correctly

---

## Common Issues & Solutions

**Issue: URLs not generating correctly**
- Solution: Check `NEXT_PUBLIC_APP_URL` env var is set
- Make sure it includes `https://` prefix

**Issue: Stripe validation fails**
- Solution: Ensure keys are real Stripe test keys
- Check both keys are from same account (test vs live)

**Issue: OpenAI registration fails**
- Solution: Verify OpenAI merchant ID and API key are configured in workspace settings
- Check checkout URLs are publicly accessible

**Issue: Orders not appearing**
- Solution: Verify Stripe webhook is configured
- Check webhook events are selected correctly
- Test webhook using Stripe CLI

**Issue: Encryption errors**
- Solution: Set `ENCRYPTION_KEY` env var
- Restart dev server after setting env vars

---

## Stripe Webhook Setup (Manual Step)

After completing wizard step 2, user must:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL (copied from step 2)
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret
6. (Optional) Return to step 1 and add webhook secret

---

## Production Considerations

### Security
- [ ] API keys encrypted in database ✅
- [ ] Webhook signatures verified ✅
- [ ] HTTPS enforced for all endpoints
- [ ] Rate limiting on checkout endpoint
- [ ] CORS configured correctly

### Monitoring
- [ ] Log all checkout sessions
- [ ] Track failed payments
- [ ] Monitor OpenAI registration status
- [ ] Alert on webhook failures

### Testing
- [ ] Test with Stripe test mode
- [ ] Verify webhook delivery
- [ ] Test order fulfillment flow
- [ ] Confirm tracking numbers work

---

## Next Steps After Integration

1. **Test end-to-end:**
   - Complete wizard
   - Create test order in ChatGPT
   - Verify order appears in dashboard
   - Update order status
   - Check tracking link

2. **Production setup:**
   - Switch to Stripe live keys
   - Configure production webhook
   - Set production app URL
   - Test with real payment

3. **Merchant onboarding:**
   - Create setup guide
   - Record walkthrough video
   - Add help tooltips
   - Build troubleshooting docs

---

## Support Resources

**Stripe Documentation:**
- Checkout Sessions: https://stripe.com/docs/api/checkout/sessions
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

**OpenAI Commerce:**
- Checkout Spec: https://developers.openai.com/commerce/specs/checkout
- API Reference: https://developers.openai.com/commerce/api-reference

**Our Docs:**
- Merchant setup guide: `docs/MVP-MERCHANT-SETUP-GUIDE.md`
- Backend implementation: `src/lib/checkout/`
- API reference: tRPC router

---

**Questions? Issues?**

Open a GitHub issue or continue in Cursor/Claude with specific questions about integration.

Good luck! 🚀
