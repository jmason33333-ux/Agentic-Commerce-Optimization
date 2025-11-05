# End-to-End Testing Guide
## Nobo Studio MVP - Pre-Production Bug Bash

**Version:** 1.0
**Last Updated:** 2025-11-05
**Target Environment:** Staging/Pre-Production

---

## 📋 Table of Contents

1. [Testing Prerequisites](#testing-prerequisites)
2. [Test Data Requirements](#test-data-requirements)
3. [Testing Workflows](#testing-workflows)
4. [Bug Reporting Guidelines](#bug-reporting-guidelines)
5. [Critical Path Tests](#critical-path-tests)
6. [Edge Case Tests](#edge-case-tests)
7. [Security Tests](#security-tests)
8. [Performance Tests](#performance-tests)
9. [Browser/Device Matrix](#browserdevice-matrix)
10. [Test Data to Collect](#test-data-to-collect)

---

## 🔧 Testing Prerequisites

### Required Accounts
- [ ] Shopify test store (with at least 20 products)
- [ ] OpenAI merchant account (or sandbox credentials)
- [ ] Stripe test account
- [ ] Valid email address for account creation

### Test Environment Setup
- [ ] Staging URL is accessible
- [ ] Database is seeded with clean state
- [ ] Redis is running (for rate limiting)
- [ ] All environment variables are set correctly

### Test Tools
- [ ] Browser DevTools (Network tab, Console)
- [ ] Screenshot/screen recording tool
- [ ] Spreadsheet for tracking bugs
- [ ] Network inspection tool (optional: Charles Proxy, Postman)

---

## 📊 Test Data Requirements

### Shopify Test Store Setup
Create a test store with:
- **10 complete products** (all required fields present)
  - Title, description, price, images, GTIN/brand
- **5 incomplete products** (missing various fields)
  - 2 missing GTIN and brand
  - 1 missing image
  - 1 missing description
  - 1 missing price
- **5 out-of-stock products**
- **Products in different price ranges:** $0.99, $10, $50, $500, $5000
- **Products in different categories:** Electronics, Clothing, Home Goods

### Store Policies
Prepare valid URLs for:
- Privacy Policy
- Terms of Service
- Return Policy

---

## 🧪 Testing Workflows

## CRITICAL PATH 1: Complete Wizard Flow (Happy Path)

**Goal:** Complete all 8 wizard steps successfully and launch on ChatGPT

### Step 0: Merchant Application

**Test ID:** `WIZ-00-001`

**Steps:**
1. Navigate to `/wizard/step-0`
2. Check initial status is "Not Started"
3. Click "Mark as Submitted"
4. Verify status changes to "Pending"
5. Click "Mark as Approved" (admin action)
6. Verify status shows "Approved" with green badge
7. Click "Continue to Shopify Setup"
8. Verify redirect to Step 1

**Expected Results:**
- [ ] Status badges display correctly (gray → yellow → green)
- [ ] "Continue" button only enabled when status is "Approved"
- [ ] Progress stepper shows Step 0 as complete
- [ ] Redirect happens smoothly

**Data to Collect:**
- Screenshot of each status state
- Console errors (if any)
- Network requests for status updates

---

### Step 1: Shopify Connection

**Test ID:** `WIZ-01-001`

**Steps:**
1. Navigate to `/wizard/step-1`
2. Enter Shopify store domain (e.g., `test-store.myshopify.com`)
3. Click "Connect Store"
4. Complete OAuth flow in Shopify popup/redirect
5. Return to app and verify success message
6. Check products imported count

**Expected Results:**
- [ ] Domain validation works (strips `.myshopify.com` automatically)
- [ ] OAuth popup opens correctly
- [ ] After authorization, returns to app
- [ ] Products count shows correct number
- [ ] "Continue to Store Information" button is enabled
- [ ] Progress stepper shows Step 1 as complete

**Edge Cases to Test:**
- [ ] Invalid domain format (e.g., `not-a-store`)
- [ ] Domain without `.myshopify.com`
- [ ] OAuth cancellation (user clicks "Cancel" in Shopify)
- [ ] Network timeout during OAuth
- [ ] Store with 0 products
- [ ] Store with 1000+ products

**Data to Collect:**
- OAuth redirect URL
- Products imported count
- Time taken for import
- Any API errors

---

### Step 2: Store Information

**Test ID:** `WIZ-02-001`

**Steps:**
1. Navigate to `/wizard/step-2`
2. Verify form is pre-populated from Shopify data
3. Edit all fields:
   - Store Name
   - Store URL
   - Privacy Policy URL
   - Terms of Service URL
   - Return Policy URL
   - Return Window (days)
4. Click "Save & Continue"
5. Verify success message
6. Verify redirect to Step 3

**Expected Results:**
- [ ] Form loads with Shopify data
- [ ] All fields are editable
- [ ] URL validation works (must start with `https://`)
- [ ] Return window accepts numbers only
- [ ] Save succeeds and shows success message
- [ ] Progress stepper shows Step 2 as complete

**Edge Cases to Test:**
- [ ] Empty required fields
- [ ] Invalid URLs (e.g., `not-a-url`, `http://` instead of `https://`)
- [ ] Return window with negative numbers
- [ ] Return window with decimals
- [ ] Very long store name (>200 characters)
- [ ] Special characters in URLs

**Data to Collect:**
- Validation error messages
- Saved data (verify in UI after reload)

---

### Step 3: Product Review

**Test ID:** `WIZ-03-001`

**Steps:**
1. Navigate to `/wizard/step-3`
2. Verify product readiness summary shows correct counts
3. Review "Ready" products section
4. Review "Incomplete" products section
5. Check missing fields for each incomplete product
6. Click "Enable All Ready Products"
7. Verify enabled count updates
8. Attempt to enable an incomplete product
9. Verify error message
10. Click "Continue to Feed Setup"

**Expected Results:**
- [ ] Readiness summary shows: Total, Ready, Incomplete counts
- [ ] Ready products have green "✓ Ready" badge
- [ ] Incomplete products show "Missing Fields" badge
- [ ] Missing fields are listed clearly (e.g., "Missing: GTIN or Brand, Image")
- [ ] "Enable All Ready Products" enables only complete products
- [ ] Attempting to enable incomplete product shows error
- [ ] Progress stepper shows Step 3 as complete

**Edge Cases to Test:**
- [ ] All products ready (100% complete)
- [ ] All products incomplete (0% complete)
- [ ] Store with 0 products
- [ ] Store with 500+ products (check performance)
- [ ] Product missing multiple fields
- [ ] Product missing only GTIN/Brand (check "at least one" logic)

**Required Fields to Verify:**
1. Title
2. Description
3. Price (> 0)
4. Image URL
5. Product URL
6. Availability
7. GTIN **OR** Brand (at least one)

**Data to Collect:**
- Readiness percentages
- List of incomplete products with missing fields
- Performance (page load time with many products)

---

### Step 4: OpenAI Feed Configuration

**Test ID:** `WIZ-04-001`

**Steps:**
1. Navigate to `/wizard/step-4`
2. Enter OpenAI Merchant ID (test value: `merchant_test_123`)
3. Enter OpenAI API Key (use test key or masked production key)
4. Toggle "Show API Key" to verify masking works
5. Select feed refresh interval: "Daily"
6. Click "Save Configuration"
7. Verify success message
8. Click "Preview Feed"
9. Verify feed preview shows first 10 products in TSV format
10. Click "Submit Feed to OpenAI"
11. Verify submission success
12. Click "Continue to Payment Setup"

**Expected Results:**
- [ ] Merchant ID accepts alphanumeric input
- [ ] API Key is masked by default (shows `••••••••`)
- [ ] Show/hide toggle works for API key
- [ ] Refresh interval options: Manual, Daily, Every 15 minutes
- [ ] Save succeeds and shows success message
- [ ] Feed preview shows TSV format with headers
- [ ] Feed submission shows loading state
- [ ] Submission success shows confirmation
- [ ] Progress stepper shows Step 4 as complete

**Edge Cases to Test:**
- [ ] Empty Merchant ID
- [ ] Empty API Key
- [ ] Invalid API Key format
- [ ] Feed submission with 0 enabled products
- [ ] Network timeout during submission
- [ ] Rate limiting (submit feed 10+ times rapidly)

**Security Checks:**
- [ ] API Key is encrypted in database (check Network tab - should not see plaintext)
- [ ] API Key is not visible in URL or query params
- [ ] Feed preview does not expose sensitive data

**Data to Collect:**
- Feed format (TSV/CSV/JSON)
- Number of products in feed
- Feed submission response
- Any encryption errors

---

### Step 5: Stripe Payment Configuration

**Test ID:** `WIZ-05-001`

**Steps:**
1. Navigate to `/wizard/step-5`
2. Toggle between Test Mode and Live Mode
3. In Test Mode, enter:
   - Publishable Key: `pk_test_...`
   - Secret Key: `sk_test_...`
   - Webhook Secret: `whsec_...`
4. Toggle "Show Secret Key" to verify masking
5. Click "Test Connection"
6. Verify connection success message
7. Click "Save Configuration"
8. Review webhook setup instructions
9. Click "Continue to Checkout Registration"

**Expected Results:**
- [ ] Test/Live mode toggle works
- [ ] All keys are masked by default
- [ ] Show/hide toggles work independently
- [ ] Test Connection validates keys with Stripe API
- [ ] Save succeeds and shows success message
- [ ] Webhook instructions show correct endpoint URL
- [ ] Code snippet for webhook handler is provided
- [ ] Progress stepper shows Step 5 as complete

**Edge Cases to Test:**
- [ ] Empty keys
- [ ] Invalid key format (e.g., wrong prefix)
- [ ] Mismatched keys (test publishable with live secret)
- [ ] Test connection with invalid keys
- [ ] Network timeout during test

**Security Checks:**
- [ ] Keys are encrypted in database
- [ ] Keys are not visible in Network tab
- [ ] Webhook secret is not exposed in client-side code

**Data to Collect:**
- Stripe connection test result
- Webhook endpoint URL
- Any Stripe API errors

---

### Step 6: OpenAI Checkout Registration

**Test ID:** `WIZ-06-001`

**Steps:**
1. Navigate to `/wizard/step-6`
2. Review pre-registration checklist
3. Verify configuration summary shows:
   - Checkout URL
   - Return URL
   - Supported countries
   - Payment provider: "Stripe"
4. Click "Register Checkout with OpenAI"
5. Verify registration success message
6. Verify registration status shows "Registered"
7. Click "Continue to Testing"

**Expected Results:**
- [ ] Checklist shows all previous steps complete
- [ ] Configuration summary is accurate
- [ ] Registration button is only enabled when checklist is complete
- [ ] Registration shows loading state
- [ ] Success message appears
- [ ] Status updates to "Registered"
- [ ] Progress stepper shows Step 6 as complete

**Edge Cases to Test:**
- [ ] Registration with incomplete previous steps
- [ ] Network timeout during registration
- [ ] Duplicate registration (attempt to register twice)
- [ ] Invalid checkout URL format

**Data to Collect:**
- OpenAI registration response
- Registration ID
- Any API errors

---

### Step 7: Testing & Launch

**Test ID:** `WIZ-07-001`

**Steps:**
1. Navigate to `/wizard/step-7`
2. Review all 7 test suites:
   - Shopify Connection Test
   - Product Feed Test
   - OpenAI Feed Submission Test
   - Stripe Connection Test
   - OpenAI Checkout Registration Test
   - End-to-End Checkout Test
   - Feed Refresh Test
3. Click "Run All Tests"
4. Wait for all tests to complete
5. Verify progress bar shows 100%
6. Verify all tests show "✓ Pass" badges
7. Click "Launch on ChatGPT!"
8. Verify success message and confetti animation
9. Click "Go to Dashboard"
10. Verify redirect to dashboard

**Expected Results:**
- [ ] All test suites are listed with descriptions
- [ ] "Run All Tests" shows loading state
- [ ] Progress bar updates in real-time
- [ ] Each test shows individual pass/fail status
- [ ] Launch button only enabled when all tests pass
- [ ] Launch shows success confirmation
- [ ] Confetti animation plays (visual indicator)
- [ ] Redirect to dashboard works
- [ ] Progress stepper shows Step 7 as complete

**Edge Cases to Test:**
- [ ] One test fails - verify launch button disabled
- [ ] Network timeout during tests
- [ ] Re-run tests after initial run
- [ ] Navigate away during test run and return

**Data to Collect:**
- Test execution time
- Any failing tests and error messages
- Launch confirmation details

---

## CRITICAL PATH 2: Post-Wizard Dashboard & Product Management

### Dashboard Review

**Test ID:** `DASH-01-001`

**Steps:**
1. Navigate to `/dashboard` (after completing wizard)
2. Verify success banner: "Your store is live on ChatGPT!"
3. Review product count cards:
   - Total Products
   - Enabled on ChatGPT
   - Need Work
4. Review Feed Status card:
   - Last submitted timestamp
   - Feed status badge
   - Auto-refresh interval
5. Click "Re-submit Feed Now"
6. Verify feed submission success
7. Review "Incomplete Products CTA" (if incomplete products exist)
8. Click "View Incomplete Products"
9. Verify redirect to Products page with filter applied
10. Navigate back to dashboard
11. Test Quick Actions:
    - Manage Products → `/products`
    - Edit Store Info → `/wizard/step-2`
    - Settings → `/settings`

**Expected Results:**
- [ ] Success banner shows only when wizard complete
- [ ] Product counts are accurate
- [ ] Feed status shows correct timestamp and status
- [ ] Re-submit button shows loading state
- [ ] Re-submit updates timestamp and status
- [ ] Incomplete CTA shows only when incomplete products exist
- [ ] Quick actions navigate correctly
- [ ] "What's next?" info box is helpful

**Edge Cases to Test:**
- [ ] Dashboard with 0 products
- [ ] Dashboard with 100% complete products
- [ ] Dashboard with 0% complete products
- [ ] Feed never submitted (no timestamp)
- [ ] Feed submission failure

**Data to Collect:**
- Product count accuracy
- Feed submission response time
- Any console errors

---

### Products Page - Filter & Search

**Test ID:** `PROD-01-001`

**Steps:**
1. Navigate to `/products`
2. Verify product count cards match dashboard
3. Test status filter:
   - Select "All Products"
   - Select "Enabled Only"
   - Select "Incomplete Only"
4. Test search:
   - Search for product by name
   - Search for partial match
   - Search for non-existent product
5. Test bulk selection:
   - Select all products
   - Select 5 products manually
6. Test bulk enable:
   - Select multiple ready products
   - Click "Enable"
   - Verify enabled count updates
7. Test bulk disable:
   - Select multiple enabled products
   - Click "Disable"
   - Verify enabled count updates

**Expected Results:**
- [ ] Filters work correctly
- [ ] Search updates results in real-time
- [ ] Product count cards update with filters
- [ ] Bulk selection selects visible products only
- [ ] Bulk enable only enables ready products
- [ ] Bulk disable works for all selected products
- [ ] Loading states appear during operations

**Edge Cases to Test:**
- [ ] Filter with 0 results
- [ ] Search with special characters
- [ ] Bulk enable with mix of ready and incomplete products
- [ ] Rapid filter/search changes (debouncing)

**Data to Collect:**
- Filter performance with large datasets
- Search response time
- Bulk operation success/failure

---

### Products Page - Individual Product Actions

**Test ID:** `PROD-02-001`

**Steps:**
1. Navigate to `/products`
2. Locate a "Ready" product
3. Click enable toggle
4. Verify product shows "Enabled on ChatGPT" badge
5. Click enable toggle again to disable
6. Verify badge is removed
7. Locate an "Incomplete" product
8. Verify missing fields are listed
9. Click "Complete" button
10. Verify redirect to product edit page

**Expected Results:**
- [ ] Enable toggle works for ready products
- [ ] Badge appears/disappears correctly
- [ ] Incomplete products show specific missing fields
- [ ] "Complete" button navigates to edit page
- [ ] Product images display correctly
- [ ] Price displays in correct currency

**Edge Cases to Test:**
- [ ] Product with no image
- [ ] Product with price = 0
- [ ] Product with very long title (truncation)
- [ ] Product missing all fields

**Data to Collect:**
- Toggle response time
- Missing fields accuracy

---

### Product Edit Page

**Test ID:** `PROD-03-001`

**Steps:**
1. Navigate to incomplete product edit page
2. Verify missing fields banner shows correct fields
3. Fill in all required fields:
   - Title: "Test Product MVP"
   - Description: "This is a test product for the MVP bug bash"
   - Price: 49.99
   - Currency: USD
   - Image URL: Valid image URL
   - Product URL: Valid product URL
   - Availability: "in stock"
   - Brand: "Test Brand"
4. Verify green checkmarks appear as fields are completed
5. Verify "Missing Required Fields" banner changes to "Product Ready!"
6. Click "Save Product"
7. Verify save success
8. Verify enable toggle appears
9. Click enable toggle
10. Verify product is enabled
11. Click "Back to Products"
12. Verify product now shows as "Ready" and "Enabled on ChatGPT"

**Expected Results:**
- [ ] Form loads with existing data
- [ ] Real-time validation shows checkmarks
- [ ] Status banner updates when all fields complete
- [ ] Save button shows loading state
- [ ] Enable toggle appears only when ready
- [ ] Enable toggle updates status
- [ ] Navigation back to products works
- [ ] Product status reflects changes

**Edge Cases to Test:**
- [ ] Save with empty required fields (should show errors)
- [ ] Invalid URL formats (should show errors)
- [ ] Price with negative value (should show error)
- [ ] Price with text input (should validate)
- [ ] Image URL that fails to load (should handle gracefully)
- [ ] Very long description (>5000 characters)
- [ ] Special characters in title/description
- [ ] Only GTIN provided (no Brand) - should be valid
- [ ] Only Brand provided (no GTIN) - should be valid
- [ ] Neither GTIN nor Brand - should show error

**Form Validation to Test:**
- [ ] Title: Required, min 1 character
- [ ] Description: Required, min 1 character
- [ ] Price: Required, must be > 0
- [ ] Image URL: Required, must start with http
- [ ] Product URL: Required, must start with http
- [ ] Availability: Required, dropdown selection
- [ ] GTIN or Brand: At least one required

**Data to Collect:**
- Validation error messages
- Save response time
- Enable toggle response time

---

## 🚨 Critical Path Tests Summary

**These tests MUST pass before production:**

| Test ID | Test Name | Priority | Status |
|---------|-----------|----------|--------|
| WIZ-00-001 | Merchant Application | P0 | ⬜ |
| WIZ-01-001 | Shopify OAuth Connection | P0 | ⬜ |
| WIZ-02-001 | Store Information Save | P0 | ⬜ |
| WIZ-03-001 | Product Review & Enable | P0 | ⬜ |
| WIZ-04-001 | OpenAI Feed Submission | P0 | ⬜ |
| WIZ-05-001 | Stripe Configuration | P0 | ⬜ |
| WIZ-06-001 | Checkout Registration | P0 | ⬜ |
| WIZ-07-001 | Testing & Launch | P0 | ⬜ |
| DASH-01-001 | Dashboard Review | P0 | ⬜ |
| PROD-01-001 | Products Filter & Search | P0 | ⬜ |
| PROD-02-001 | Product Enable/Disable | P0 | ⬜ |
| PROD-03-001 | Product Edit & Save | P0 | ⬜ |

---

## 🔍 Edge Case Tests

### Authentication & Authorization

**Test ID:** `AUTH-01-001`

**Scenarios:**
- [ ] Sign up with new email
- [ ] Sign up with existing email (should show error)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (should show error)
- [ ] Sign out and verify redirect to login
- [ ] Access protected route without auth (should redirect to login)
- [ ] Session timeout (wait 24 hours, verify re-login required)
- [ ] Multiple tabs with same session
- [ ] Sign in on different browser

**Data to Collect:**
- Session duration
- Auth errors
- Redirect behavior

---

### Data Persistence

**Test ID:** `DATA-01-001`

**Scenarios:**
- [ ] Complete Step 1, refresh page, verify data persists
- [ ] Complete Step 2, navigate away, return, verify data persists
- [ ] Enable products, refresh page, verify still enabled
- [ ] Edit product, navigate away without saving, verify no changes
- [ ] Edit product, save, refresh, verify changes persist
- [ ] Clear browser cache, verify session remains active

---

### Navigation & Routing

**Test ID:** `NAV-01-001`

**Scenarios:**
- [ ] Navigate through wizard using "Continue" buttons
- [ ] Navigate through wizard using progress stepper
- [ ] Attempt to skip to future step (should be disabled)
- [ ] Navigate to completed step (should be allowed)
- [ ] Use browser back button during wizard
- [ ] Use browser forward button during wizard
- [ ] Bookmark wizard step, access later
- [ ] Access wizard step via direct URL

---

### Error Handling

**Test ID:** `ERR-01-001`

**Scenarios:**
- [ ] Network timeout during Shopify OAuth
- [ ] Network timeout during feed submission
- [ ] Invalid API credentials for OpenAI
- [ ] Invalid API credentials for Stripe
- [ ] Database connection failure
- [ ] Redis unavailable (rate limiting should gracefully degrade)
- [ ] Shopify API rate limit hit
- [ ] OpenAI API rate limit hit
- [ ] Server 500 error

**Expected Error Handling:**
- [ ] User-friendly error messages (not technical stack traces)
- [ ] Retry options where appropriate
- [ ] Clear next steps for user
- [ ] Errors logged to console for debugging
- [ ] No data loss on error

---

### Rate Limiting

**Test ID:** `RATE-01-001`

**Scenarios:**
- [ ] Submit feed 10 times in 1 minute (should hit rate limit)
- [ ] Verify rate limit error message is clear
- [ ] Wait for rate limit to expire, verify can submit again
- [ ] Test rate limit for product updates
- [ ] Test rate limit for Stripe connection tests

**Expected Results:**
- [ ] Rate limit message: "Too many requests. Please wait X seconds."
- [ ] Rate limit resets after time window
- [ ] Rate limit does not permanently block user

---

## 🔒 Security Tests

### API Key Encryption

**Test ID:** `SEC-01-001`

**Checks:**
- [ ] OpenAI API Key is encrypted in database (check database directly)
- [ ] Stripe Secret Key is encrypted in database
- [ ] Webhook Secret is encrypted in database
- [ ] API Keys are never visible in Network tab responses
- [ ] API Keys are never visible in URL parameters
- [ ] Decryption only happens server-side

---

### OAuth Security

**Test ID:** `SEC-02-001`

**Checks:**
- [ ] OAuth state parameter is validated
- [ ] OAuth code is single-use (attempt to reuse code)
- [ ] OAuth redirect URI is validated
- [ ] CSRF protection is in place
- [ ] No sensitive data in OAuth redirect URL

---

### Input Sanitization

**Test ID:** `SEC-03-001`

**Scenarios:**
- [ ] Enter `<script>alert('xss')</script>` in product title (should be escaped)
- [ ] Enter SQL injection string in search field (should be sanitized)
- [ ] Enter very long strings (>10,000 characters) in text fields
- [ ] Upload malicious image URL
- [ ] Enter special characters in all form fields

**Expected Results:**
- [ ] No XSS vulnerabilities
- [ ] No SQL injection vulnerabilities
- [ ] No buffer overflow errors
- [ ] All user input is sanitized

---

### Authorization

**Test ID:** `SEC-04-001`

**Scenarios:**
- [ ] User A creates workspace, User B tries to access (should be denied)
- [ ] User A edits product, User B tries to edit same product (should be denied)
- [ ] Attempt to access API endpoints without auth token
- [ ] Attempt to access API endpoints with expired token
- [ ] Attempt to access another workspace's products via API

---

## ⚡ Performance Tests

### Page Load Times

**Test ID:** `PERF-01-001`

**Metrics to Collect:**

| Page | Target Load Time | Actual Load Time | Status |
|------|------------------|------------------|--------|
| Dashboard | < 2s | | ⬜ |
| Products (50 items) | < 3s | | ⬜ |
| Products (500 items) | < 5s | | ⬜ |
| Product Edit | < 2s | | ⬜ |
| Wizard Steps | < 1s each | | ⬜ |

**Tools:** Chrome DevTools Performance tab

---

### API Response Times

**Test ID:** `PERF-02-001`

**Metrics to Collect:**

| API Endpoint | Target Response | Actual Response | Status |
|--------------|-----------------|-----------------|--------|
| GET /products | < 500ms | | ⬜ |
| POST /update-product | < 1s | | ⬜ |
| POST /submit-feed | < 5s | | ⬜ |
| POST /toggle-product | < 500ms | | ⬜ |
| GET /product-readiness | < 1s | | ⬜ |

---

### Shopify Sync Performance

**Test ID:** `PERF-03-001`

**Scenarios:**
- [ ] Import 10 products (measure time)
- [ ] Import 100 products (measure time)
- [ ] Import 500 products (measure time)
- [ ] Import 1000 products (measure time)

**Expected:**
- Should not timeout
- Should show progress indicator
- Should handle errors gracefully

---

## 🌐 Browser/Device Matrix

### Desktop Browsers

| Browser | Version | OS | Status |
|---------|---------|-----|--------|
| Chrome | Latest | macOS | ⬜ |
| Chrome | Latest | Windows | ⬜ |
| Firefox | Latest | macOS | ⬜ |
| Firefox | Latest | Windows | ⬜ |
| Safari | Latest | macOS | ⬜ |
| Edge | Latest | Windows | ⬜ |

### Mobile Browsers

| Browser | Device | OS | Status |
|---------|--------|-----|--------|
| Safari | iPhone 14 | iOS 17 | ⬜ |
| Chrome | Pixel 7 | Android 13 | ⬜ |
| Safari | iPad Pro | iOS 17 | ⬜ |

### Screen Resolutions

- [ ] 1920x1080 (Desktop)
- [ ] 1366x768 (Laptop)
- [ ] 390x844 (iPhone 14)
- [ ] 430x932 (iPhone 14 Pro Max)
- [ ] 360x800 (Android)

---

## 📝 Bug Reporting Guidelines

### Bug Report Template

```markdown
## Bug Report

**Bug ID:** BUG-[DATE]-[NUMBER]
**Severity:** P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
**Test ID:** [Reference to test case]
**Reporter:** [Your name]
**Date:** [Date found]

### Environment
- Browser: [e.g., Chrome 119]
- OS: [e.g., macOS 14.0]
- Device: [e.g., MacBook Pro]
- URL: [Exact URL where bug occurred]

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshots/Video
[Attach screenshots or screen recording]

### Console Errors
[Copy any console errors]

### Network Tab
[Copy relevant network requests/responses]

### Additional Context
[Any other relevant information]

### Workaround
[If any workaround exists]
```

### Severity Definitions

**P0 - Critical (Blocker)**
- Application crashes or is unusable
- Data loss or corruption
- Security vulnerability
- Payment processing failure
- Wizard cannot be completed
- Examples:
  - "Cannot complete Shopify OAuth - infinite loading"
  - "API keys visible in plaintext in Network tab"
  - "Feed submission always fails"

**P1 - High**
- Major feature broken but workaround exists
- Significant UI/UX issue
- Performance issue affecting usability
- Examples:
  - "Product enable toggle doesn't update count"
  - "Dashboard shows incorrect product counts"
  - "Page takes 30+ seconds to load"

**P2 - Medium**
- Minor feature broken
- UI inconsistency
- Confusing error message
- Examples:
  - "Button text has typo"
  - "Badge color is inconsistent"
  - "Help text is unclear"

**P3 - Low**
- Cosmetic issue
- Nice-to-have improvement
- Edge case bug
- Examples:
  - "Icon alignment is off by 2px"
  - "Missing loading state on minor action"

---

## 📊 Test Data to Collect

### For Each Test Session

Create a spreadsheet with these columns:

| Test ID | Tester | Date/Time | Browser | OS | Status | Bug ID | Notes |
|---------|--------|-----------|---------|----|----|--------|-------|
| WIZ-01-001 | John | 2025-11-05 14:30 | Chrome 119 | macOS | ✅ Pass | - | Smooth OAuth flow |
| WIZ-03-001 | Jane | 2025-11-05 14:35 | Safari 17 | macOS | ❌ Fail | BUG-001 | Enable button not working |

### Performance Metrics Log

| Metric | Target | Actual | Status | Notes |
|--------|--------|--------|--------|-------|
| Dashboard Load Time | < 2s | 1.2s | ✅ | |
| Products Page (500 items) | < 5s | 7.8s | ❌ | Needs optimization |
| Feed Submission | < 5s | 3.1s | ✅ | |

### User Flows Completion Rate

Track how many testers can complete end-to-end flows:

| Flow | Attempted | Completed | Completion Rate | Blockers |
|------|-----------|-----------|-----------------|----------|
| Complete Wizard | 10 | 8 | 80% | Step 3 enable bug |
| Edit Product | 10 | 10 | 100% | - |
| Dashboard Actions | 10 | 9 | 90% | Feed re-submit timeout |

### API Error Log

| Timestamp | Endpoint | Status Code | Error Message | User Impact |
|-----------|----------|-------------|---------------|-------------|
| 14:30:15 | POST /feed/submit | 429 | Rate limit exceeded | User blocked from submission |
| 14:35:22 | GET /products | 500 | Database timeout | Products page won't load |

---

## 🎯 Test Session Checklist

### Before Testing
- [ ] Staging environment is up and running
- [ ] Test data is seeded (products, store info)
- [ ] All testers have accounts
- [ ] Bug tracking sheet is set up
- [ ] Screen recording is enabled
- [ ] Browser DevTools is open

### During Testing
- [ ] Follow test scripts exactly
- [ ] Take screenshots of errors
- [ ] Copy console errors immediately
- [ ] Note any confusing UX
- [ ] Report bugs in real-time (don't wait)
- [ ] Try edge cases not in script
- [ ] Test on different browsers

### After Testing
- [ ] Submit all bug reports
- [ ] Share performance metrics
- [ ] Document any workarounds found
- [ ] Rate overall user experience (1-10)
- [ ] List 3 biggest issues found
- [ ] Suggest improvements

---

## 🚀 Ready for Production Criteria

### All P0 Bugs Resolved
- [ ] No critical bugs remain
- [ ] All wizard steps completable
- [ ] All data persists correctly
- [ ] No security vulnerabilities

### Performance Targets Met
- [ ] Dashboard loads < 2s
- [ ] Products page loads < 5s (with 500 items)
- [ ] API responses < 1s average
- [ ] No memory leaks

### Browser Compatibility
- [ ] Works on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Mobile responsive on iPhone and Android
- [ ] No console errors on any browser

### Security Validated
- [ ] API keys encrypted
- [ ] OAuth flow secure
- [ ] No XSS vulnerabilities
- [ ] Input sanitization working
- [ ] Authorization checks in place

### User Experience
- [ ] 90%+ completion rate on end-to-end flow
- [ ] Clear error messages
- [ ] Helpful loading states
- [ ] Intuitive navigation
- [ ] No confusing UI elements

---

## 📞 Testing Support

### Questions During Testing
- Slack: #bug-bash-mvp
- Email: testing@nobostudio.com

### Reporting Critical Bugs
- Immediately post in Slack with `@channel`
- Create bug report within 5 minutes
- Include video if possible

### Daily Standup
- Time: 9:00 AM daily during bug bash
- Share: Bugs found, blockers, progress

---

## 📅 Testing Schedule

### Day 1: Critical Path
- Complete all WIZ tests (Steps 0-7)
- Complete DASH-01-001
- Focus: Can users complete wizard?

### Day 2: Product Management
- Complete all PROD tests
- Test edge cases
- Focus: Can users manage products?

### Day 3: Edge Cases & Security
- Complete AUTH, DATA, NAV tests
- Complete all SEC tests
- Focus: Is the app secure?

### Day 4: Performance & Cross-Browser
- Complete all PERF tests
- Test on all browsers/devices
- Focus: Is the app fast and compatible?

### Day 5: Final Validation
- Retest all P0/P1 bug fixes
- End-to-end flow validation
- Sign-off for production

---

## ✅ Sign-Off

### QA Lead Approval
- [ ] All P0 bugs resolved
- [ ] All critical paths tested
- [ ] Performance targets met
- [ ] Security validated
- [ ] Browser compatibility confirmed

**Signature:** ___________________
**Date:** ___________________

### Product Owner Approval
- [ ] User flows work as expected
- [ ] UX meets requirements
- [ ] Ready for production launch

**Signature:** ___________________
**Date:** ___________________

---

**End of Testing Guide**

*For questions or issues with this testing guide, contact: testing@nobostudio.com*
