# Nobo Product Roadmap
## Governed AI for E-commerce

**Version**: 1.0
**Timeline**: 3 Years (Seed to Series A)

---

## 🎯 Product Vision

**"Every AI agent action flows through Nobo—observable, governable, insurable."**

We're building the **control layer** that makes AI agents safe to deploy in production. Our product evolves in three phases:

**Phase 1** (Months 0-12): **Policy + Audit**
- Merchants and agencies can control what AI does
- Full visibility and audit trail

**Phase 2** (Months 12-24): **Stop-Loss + Multi-Channel**
- Financial guardrails (self-insured coverage)
- Expand beyond Shopify to support/CX

**Phase 3** (Months 24-36): **Insurance + Multi-Vertical**
- Full insurance partnership
- CRM/RevOps governance
- API marketplace

---

## 📋 Phase 1: Policy + Audit (Months 0-12)

### Goal

**Make AI governable for Shopify agencies and merchants**

**Success Criteria:**
- ✅ 40 customers (20 agencies, 20 merchants)
- ✅ 200 workspaces under governance
- ✅ 100K+ AI actions governed per month
- ✅ $450K ARR

---

### Month 0-3: MVP + Design Partners

#### Core Features

**1. Nobo Policy Engine** 🎯

**What**: Declarative rules for AI actions

**Features**:
- Policy builder UI (no-code)
  - Condition: "If action_type = PRODUCT_UPDATE"
  - Condition: "AND risk_score > 50"
  - Condition: "AND target field = 'price'"
  - Action: "Escalate to human approval"

- Pre-built policy templates:
  - "Auto-approve low-risk ACP metafield updates"
  - "Require approval for public PDP title changes"
  - "Require approval for pricing changes > 20%"
  - "Auto-deny bulk updates > 100 products"

- Policy testing/simulation
  - "What would happen if I applied this policy to last week's AI actions?"

**Tech Stack**:
- Backend: Node.js + tRPC
- Policy engine: Rules engine (e.g., json-rules-engine)
- Database: PostgreSQL (policy storage)

**Success Metric**: 5 design partners set 10+ policies each

---

**2. Approval Queue** ✅

**What**: Unified inbox for all AI-proposed changes

**Features**:
- List view:
  - Product name + SKU
  - AI action type (PRODUCT_UPDATE, PRICING_UPDATE, etc.)
  - Risk score (0-100)
  - Proposed changes (before/after diff)
  - Timestamp + actor (which AI tool)

- Actions:
  - Approve (one-click)
  - Deny (with reason)
  - Defer (snooze for later)
  - Bulk approve (select multiple, approve all)

- Filters:
  - By risk level (high/medium/low)
  - By action type
  - By product/collection
  - By AI tool

**UI/UX**:
- Clean, merchant-friendly (like Shopify admin)
- Keyboard shortcuts (approve = "A", deny = "D")
- Mobile-responsive (approve on phone)

**Success Metric**: 80% of design partners use approval queue daily

---

**3. Shopify Connector** 🔌

**What**: Deep integration with Shopify API

**Features**:
- OAuth connection (1-click Shopify install)
- Read access:
  - Products (all fields: title, description, price, metafields, etc.)
  - Collections, variants, inventory
  - Orders (for revenue tracking)

- Write access:
  - Update products (after policy approval)
  - Update metafields (ACP fields)
  - Update pricing, inventory (if policy allows)

- Webhook subscriptions:
  - Product updates (detect manual changes)
  - Order events (track ChatGPT Shopping orders)

- Rate limiting & batching:
  - Shopify API has strict limits (2-4 calls/second)
  - Queue writes, batch when possible

**Success Metric**: 100% successful write-backs (no API errors)

---

**4. Outcome API (for AI tools)** 🤖

**What**: SDK for AI tool vendors to emit Nobo outcomes

**Features**:
- REST API:
  - POST `/outcomes` - Propose an AI action
  - GET `/outcomes/:id` - Check policy result
  - POST `/outcomes/:id/apply` - Apply approved outcome

- SDK (TypeScript/JavaScript):
  ```ts
  import { NoboClient } from '@nobo/sdk';

  const nobo = new NoboClient({ apiKey: 'sk_...' });

  // Propose a product update
  const outcome = await nobo.proposeProductUpdate({
    productId: 'gid://shopify/Product/12345',
    changes: {
      title: 'New optimized title for ACP',
      metafields: [...]
    },
    riskScore: 25,
    reasoning: 'ACP compliance optimization'
  });

  // outcome.status = "approved" | "denied" | "pending"
  if (outcome.status === 'approved') {
    // Nobo handles the write-back automatically
  }
  ```

- Zapier/Make integration (no-code fallback)

**Success Metric**: 2 AI tool vendors integrated by Month 6

---

**5. Audit Log** 📊

**What**: Complete history of all AI actions

**Features**:
- Filterable list:
  - Date range
  - Action type
  - Outcome (approved, denied, auto-approved)
  - Product/actor

- Export:
  - CSV export (for client reporting)
  - API access (for custom dashboards)

- Details view:
  - Full outcome payload (JSON)
  - Before/after state
  - Policy rules that matched
  - Who approved (user ID)
  - Timestamp

**Success Metric**: Agencies export audit logs for 100% of client reports

---

#### Non-Functional Requirements (Month 0-3)

**Security:**
- SOC 2 Type 1 started (prep for enterprise deals)
- Data encryption at rest + in transit
- Shopify OAuth scopes (minimal required)

**Performance:**
- Policy evaluation < 100ms
- API response time < 500ms (p95)
- Approval queue loads in < 2s

**Reliability:**
- 99.9% uptime SLA
- Automated backups (daily)
- Rollback capability (restore product state)

---

### Month 3-6: Scale + Iterate

#### New Features

**6. Multi-Workspace Management** 🏢

**What**: Agencies manage many client stores in one dashboard

**Features**:
- Workspace switcher (dropdown: "Store A", "Store B", etc.)
- Cross-workspace views:
  - All pending approvals across all clients
  - Aggregate audit log
  - Per-client reporting

- Policy inheritance:
  - Set agency-wide default policies
  - Override per client (if needed)

**Success Metric**: Avg agency manages 10+ workspaces

---

**7. Rollback Support** ↩️

**What**: Undo bad AI actions

**Features**:
- Rollback button (in audit log)
  - Click "Rollback" → restores product to previous state

- Bulk rollback:
  - "Rollback all actions from [date]"

- Rollback preview:
  - Show what will change before applying

**Success Metric**: <5% of actions rolled back (high quality AI + policies)

---

**8. Notifications & Alerts** 🔔

**What**: Notify users when action needed

**Features**:
- Email notifications:
  - "5 high-risk actions pending your approval"
  - Daily digest (at 9am)

- Slack integration:
  - Post to #ai-governance channel
  - Message format: "New high-risk action: [Product X] price change $50 → $75"

- In-app notifications (bell icon)

**Success Metric**: 80% of high-risk actions approved within 4 hours

---

#### Enhancements (Month 3-6)

**Approval Queue:**
- Add "Approve with edits" (modify AI suggestion before applying)
- Add comments ("Why did you deny this?")
- Add @mentions (assign to teammate)

**Policy Engine:**
- Add time-based rules ("Auto-approve on weekdays, escalate on weekends")
- Add product-type rules ("Different policies for apparel vs. electronics")
- Add user role-based rules ("Manager can approve, analyst cannot")

**Shopify Connector:**
- Add inventory sync (track stock levels)
- Add order attribution (which products came from ChatGPT Shopping)
- Add collection management (AI can assign products to collections)

---

### Month 6-9: Enterprise Features

#### New Features

**9. RBAC (Role-Based Access Control)** 🔐

**What**: Control who can do what

**Features**:
- Roles:
  - **Admin**: Full access (set policies, approve any action)
  - **Manager**: Approve high-risk actions
  - **Analyst**: Approve low-risk actions, view reports
  - **Viewer**: Read-only (audit log access)

- Permissions:
  - Per action type ("Manager can approve pricing, analyst cannot")
  - Per workspace ("Alice manages Store A, Bob manages Store B")

**Success Metric**: 50% of enterprise deals require RBAC

---

**10. SSO (Single Sign-On)** 🔑

**What**: Enterprise auth (SAML, OIDC)

**Features**:
- SAML integration (Okta, OneLogin, Azure AD)
- OIDC support
- JIT provisioning (auto-create users on first login)

**Success Metric**: Required for all enterprise deals (>$2K/mo)

---

**11. Advanced Audit & Compliance** 📋

**What**: Meet enterprise security requirements

**Features**:
- Compliance reports:
  - SOC 2 audit log export
  - GDPR data export (user data)
  - Retention policy configuration

- Immutable audit log (tamper-proof)
- Custom retention (7 years for regulated industries)

**Success Metric**: Pass 3 customer security reviews

---

#### Enhancements (Month 6-9)

**Policy Engine:**
- Add custom webhooks ("POST to our internal API when high-risk action occurs")
- Add policy versioning (track changes to policies over time)
- Add policy analytics ("This policy has caught 50 bad actions")

**Approval Queue:**
- Add bulk actions ("Approve all low-risk ACP updates")
- Add quick filters ("Show only my pending actions")
- Add search ("Find actions for Product X")

---

### Month 9-12: PLG + Optimization

#### New Features

**12. Self-Serve Onboarding** 🚀

**What**: PLG motion for small merchants

**Features**:
- 1-click Shopify install (OAuth)
- Guided setup wizard:
  - Step 1: "Connect your store"
  - Step 2: "Choose a policy template" (e.g., "Safe ACP optimization")
  - Step 3: "Review your first AI action"

- In-app tours (tooltips, walkthroughs)
- Knowledge base (help docs, videos)

**Success Metric**: 30% trial → paid conversion

---

**13. Analytics Dashboard** 📊

**What**: Show value to customers

**Features**:
- KPIs:
  - Total AI actions governed
  - Bad actions caught (denied/rolled back)
  - Time saved (vs. manual review)
  - Products optimized

- Charts:
  - Actions over time (line chart)
  - Actions by type (pie chart)
  - Risk score distribution (histogram)

- Insights:
  - "You've governed 5,000 actions this month (↑20% vs. last month)"
  - "3 bad actions caught—estimated savings: $450"

**Success Metric**: Customers view analytics 2x/week

---

**14. ROI Calculator** 💰

**What**: Prove value to prospects

**Features**:
- Input:
  - How many products do you manage?
  - How many AI tools do you use?
  - How many hours/week do you spend reviewing AI changes?

- Output:
  - "You'll save 15 hours/month with Nobo"
  - "ROI: 5x (you pay $299/mo, save $1,500/mo in labor)"

**Success Metric**: Used in 50% of sales demos

---

#### Optimizations (Month 9-12)

**Performance:**
- Optimize policy engine (< 50ms evaluation)
- Add caching (reduce Shopify API calls)
- Optimize approval queue (load 1,000+ pending actions in <2s)

**Reliability:**
- Add retry logic (if Shopify API fails, retry)
- Add dead-letter queue (handle failed actions)
- Add monitoring (Sentry, Datadog)

**User Experience:**
- Mobile app (iOS/Android) for approvals on-the-go
- Dark mode
- Localization (support French, Spanish for international)

---

## 📋 Phase 2: Stop-Loss + Multi-Channel (Months 12-24)

### Goal

**Add financial guardrails and expand beyond Shopify**

**Success Criteria:**
- ✅ 110 customers (60 agencies, 50 merchants)
- ✅ 900 workspaces
- ✅ Stop-loss coverage launched (20+ customers paying for coverage)
- ✅ Support/CX vertical launched (10 agencies)
- ✅ $1.6M ARR

---

### Month 12-15: Stop-Loss MVP

#### New Features

**15. Stop-Loss Coverage** 🛡️

**What**: Financial protection for bad AI actions

**Features:**
- Coverage tiers:
  - Bronze: $5K/mo coverage → +$199/mo
  - Silver: $15K/mo coverage → +$499/mo
  - Gold: $50K/mo coverage → +$999/mo

- Coverage conditions:
  - AI action must have passed policy check
  - Action must be within policy-approved parameters
  - Claim must be filed within 30 days

- Claims process:
  - Customer files claim: "AI changed price from $100 → $10, lost $5K in revenue"
  - We review audit log
  - If valid, we reimburse

**Tech:**
- Claims database (track all claims)
- Loss analytics (track loss patterns)
- Reserves (set aside capital for claims)

**Success Metric**: 20% of customers add stop-loss coverage

---

**16. Loss Analytics** 📉

**What**: Track and prevent bad AI actions

**Features:**
- Loss dashboard (internal):
  - Total claims filed
  - Total paid out
  - Loss rate ($ lost / $ actions)
  - Top loss categories (pricing errors, inventory errors, etc.)

- Pattern detection:
  - "AI Tool X has 5x higher error rate than others"
  - "Pricing actions have 2x higher loss rate"

- Auto-adjust policies:
  - If loss rate is high, tighten policies

**Success Metric**: Loss rate < 0.1% (1 in 1,000 actions causes loss)

---

#### Enhancements (Month 12-15)

**Policy Engine:**
- Add cost-based rules ("Deny if potential revenue impact > $500")
- Add confidence thresholds ("Require approval if AI confidence < 80%")

**Approval Queue:**
- Add cost estimates ("This pricing change could impact $2K in revenue")
- Add risk warnings ("High-risk: AI tool has 10% error rate")

---

### Month 15-18: Multi-Channel Expansion

#### New Vertical: Support/CX

**17. Zendesk/Gorgias/Intercom Connectors** 🎧

**What**: Govern AI in knowledge bases and support macros

**Features:**
- KB Article governance:
  - AI proposes KB article update → policy check → approval → publish
  - Action types: KB_ARTICLE_CREATE, KB_ARTICLE_UPDATE, KB_ARTICLE_DELETE

- Macro governance:
  - AI suggests new support macro → policy check → approval
  - Action types: MACRO_CREATE, MACRO_UPDATE

- Ticket action governance:
  - AI suggests ticket assignment, tagging, closing
  - Action types: TICKET_ASSIGN, TICKET_CLOSE, TICKET_TAG

**Policies for Support:**
- "Auto-approve KB updates to internal articles"
- "Require approval for public KB articles"
- "Require approval for ticket closes (prevent premature closes)"

**Success Metric**: 10 support/CX agencies in first 6 months

---

**18. Multi-System Dashboard** 🌐

**What**: Govern AI across Shopify + support + CRM

**Features:**
- System switcher:
  - View approvals for "Shopify" or "Zendesk" or "All systems"

- Cross-system policies:
  - "All public-facing content changes (PDP or KB) require approval"

- Unified audit log (all systems)

**Success Metric**: 20% of customers use 2+ systems

---

#### Enhancements (Month 15-18)

**Shopify:**
- Add variant management (AI can create/update variants)
- Add collection automation (AI assigns products to collections)
- Add tag management (AI adds/removes tags)

**Support/CX:**
- Add chat log analysis (detect sentiment, escalate if needed)
- Add canned response optimization (AI suggests better macros)

---

### Month 18-21: Enterprise Scale

#### New Features

**19. Custom Policy SDKs** 🛠️

**What**: Enterprise customers write custom policy logic

**Features:**
- JavaScript/TypeScript SDK:
  ```ts
  // Custom policy: Check external API before approving
  nobo.definePolicy('check-pricing-api', async (outcome) => {
    const competitorPrice = await fetch('https://competitor-api.com/price');
    if (outcome.price < competitorPrice * 0.9) {
      return { action: 'deny', reason: 'Price too low vs. competitor' };
    }
    return { action: 'allow' };
  });
  ```

- Webhook-based policies (call external system)
- Scheduled policies (different rules at different times)

**Success Metric**: 5 enterprise customers use custom policies

---

**20. API Marketplace** 🏪

**What**: 3rd-party integrations and policy packs

**Features:**
- Policy pack marketplace:
  - Browse pre-built policy packs ("ACP compliance pack", "Pricing governance pack")
  - 1-click install
  - Free + paid packs

- Integration marketplace:
  - 3rd-party developers build connectors (Notion, Airtable, etc.)
  - We take 20% rev share

**Success Metric**: 50 policy pack downloads in first quarter

---

#### Optimizations (Month 18-21)

**Scalability:**
- Handle 1M+ actions/month
- Multi-region deployment (US, EU)
- 99.99% uptime SLA

**Security:**
- SOC 2 Type 2 certified
- GDPR compliance
- HIPAA ready (for healthcare verticals)

---

### Month 21-24: Insurance Partnership

#### New Features

**21. Insurance Underwriter Integration** 🏦

**What**: Partner with insurance company to underwrite coverage

**Features:**
- Risk assessment API (share loss data with underwriter)
- Premium calculation (underwriter sets premiums)
- Claims handling (underwriter processes claims)

**Partners:**
- Target: Lloyd's of London, AIG, Chubb (specialized in tech/cyber insurance)

**Success Metric**: 50+ customers with full insurance coverage

---

**22. Advanced Risk Scoring** 🎯

**What**: ML-based risk prediction

**Features:**
- Train model on 1M+ actions (18 months of data)
- Predict risk score for new actions
- Auto-adjust policies based on risk

**Success Metric**: Risk prediction accuracy > 90%

---

## 📋 Phase 3: Multi-Vertical + Platform (Months 24-36)

### Goal

**Become the standard for AI governance across verticals**

**Success Criteria:**
- ✅ 260 customers (120 e-comm, 40 support, 40 CRM, 60 multi-vertical)
- ✅ 2,400+ workspaces
- ✅ Full insurance partnership live
- ✅ $4.7M ARR
- ✅ Series A closed

---

### Month 24-30: CRM/RevOps Vertical

#### New Features

**23. HubSpot/Salesforce Connectors** 📞

**What**: Govern AI in sales pipelines

**Action types:**
- CRM_LEAD_CREATE
- CRM_RECORD_UPDATE (stage, owner, deal amount)
- CRM_EMAIL_DRAFT
- CRM_TASK_CREATE

**Policies:**
- "Require approval for deal stage changes > $50K"
- "Auto-approve lead enrichment"
- "Require approval for owner re-assignment"

**Success Metric**: 40 CRM agencies/customers in 6 months

---

**24. Cross-Vertical Analytics** 📊

**What**: Insights across all systems

**Features:**
- Total AI actions governed (Shopify + support + CRM)
- ROI across all verticals
- Best practices recommendations

**Success Metric**: 30% of customers use 3+ systems

---

### Month 30-36: Platform Maturity

#### New Features

**25. White-Label Platform** 🏷️

**What**: Agencies can rebrand Nobo as their own

**Features:**
- Custom branding (logo, colors, domain)
- Custom pricing (agency sets client pricing)
- We handle infrastructure, they own customer relationship

**Pricing**: $10K setup + 30% rev share

**Success Metric**: 10 white-label partners

---

**26. AI Agent Registry** 📚

**What**: Directory of all AI agents in ecosystem

**Features:**
- Agent profiles (vendor, capabilities, risk score)
- Usage analytics ("Top 10 most-used agents")
- Recommendations ("Try Agent X for your use case")

**Success Metric**: 50+ agents registered

---

**27. Outcome Schema Registry** 🗂️

**What**: Public standard for AI outcomes

**Features:**
- Open-source schema (GitHub repo)
- Community contributions
- Versioning (v1, v2, etc.)

**Success Metric**: 20+ vendors adopt Nobo outcome schema

---

## 🛠️ Tech Stack Evolution

### Year 1 (Phase 1)

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind, shadcn/ui |
| **Backend** | Node.js, tRPC, Next.js API routes |
| **Database** | PostgreSQL (Prisma ORM) |
| **Queue** | Database-backed job queue (no Redis initially) |
| **Hosting** | Vercel (frontend + API), AWS RDS (database) |
| **Auth** | NextAuth.js (Shopify OAuth, email/password) |
| **Monitoring** | Sentry (errors), Vercel Analytics (perf) |

---

### Year 2 (Phase 2)

**Additions:**
- Redis (caching, job queue for high volume)
- Background workers (separate from API)
- Zendesk/Gorgias SDKs
- Stripe for billing (stop-loss subscriptions)
- Datadog (advanced monitoring)

---

### Year 3 (Phase 3)

**Additions:**
- Multi-region deployment (AWS us-east-1, eu-west-1)
- HubSpot/Salesforce SDKs
- ML infrastructure (risk scoring model)
- Kafka (event streaming for high-scale)
- Kubernetes (container orchestration)

---

## 🎯 Feature Prioritization Framework

### Must-Have vs. Nice-to-Have

**Must-Haves** (for MVP):
- ✅ Policy engine (basic rules)
- ✅ Approval queue
- ✅ Shopify connector
- ✅ Audit log
- ✅ Outcome API

**Nice-to-Haves** (can defer):
- ❌ Mobile app (can use responsive web)
- ❌ Dark mode (low priority)
- ❌ Localization (English-first)
- ❌ Advanced analytics (basic is fine)

---

### Customer-Driven Roadmap

**We prioritize based on**:
1. **Customer requests** (if 5+ customers ask for it, build it)
2. **Deal blockers** (if it's preventing sales, build it)
3. **Strategic bets** (insurance, multi-vertical)
4. **Technical debt** (keep product quality high)

**NOT based on**:
- Competitor features (we lead, not follow)
- Shiny new tech (pragmatic over trendy)
- Founder's pet features (customer-driven)

---

## 📅 Release Cadence

**Year 1:**
- Major releases: Quarterly (Q1, Q2, Q3, Q4)
- Minor updates: Every 2 weeks
- Hotfixes: As needed (< 24 hours)

**Communication:**
- Changelog (public, on website)
- Email updates to customers (monthly)
- Roadmap page (public, what's coming)

---

## 🎯 Success Metrics by Phase

| Phase | Key Product Metrics |
|-------|---------------------|
| **Phase 1** | - 100K+ actions governed/mo<br>- 90%+ policy evaluation accuracy<br>- <2s approval queue load time<br>- 99.9% uptime |
| **Phase 2** | - 1M+ actions/mo<br>- <0.1% loss rate (stop-loss)<br>- 2+ systems per customer (avg)<br>- 99.95% uptime |
| **Phase 3** | - 10M+ actions/mo<br>- 50+ AI agents integrated<br>- 3+ verticals live<br>- 99.99% uptime |

---

## 🚀 Conclusion

**This roadmap is designed to**:

✅ **Prove value fast** (MVP in 3 months)
✅ **Expand methodically** (one vertical at a time)
✅ **Build moats** (schema, integrations, insurance data)
✅ **Stay capital-efficient** (no over-engineering)

**By Month 36:**
- Multi-vertical platform (e-comm, support, CRM)
- Full insurance partnership
- Platform ecosystem (white-label, marketplace)
- **Series B ready** ($50-80M at $200-300M valuation)

---

*Product Roadmap by: [Your Name]*
*Contact: [Email]*
*Last updated: January 2025*
