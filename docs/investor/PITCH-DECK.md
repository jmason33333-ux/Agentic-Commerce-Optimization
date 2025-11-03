# Nobo
## Governed AI for E-commerce

**Investor Deck** · Seed Round · $1.0M

---

## 🎯 The Opportunity

**AI agents are ready to automate e-commerce operations.**

**But merchants are scared to turn them on.**

The problem isn't smarter AI.

**It's the lack of control.**

---

## 📊 Market Context

### The AI Agent Explosion

- **4.5M** Shopify merchants globally
- **100K+** using Shopify Plus (annual plan value $2K+)
- **50K+** agencies managing client stores

### Every E-commerce Tool is Adding AI

- Catalog optimization agents
- Support/CX copilots
- Inventory management agents
- Pricing & promotion agents

### But Adoption is Blocked

> "We wanted AI to optimize our 10K product catalog. But we couldn't let it run unsupervised—what if it breaks SEO? What if it changes prices without approval?"
>
> — *Shopify Plus Merchant, $15M GMV*

---

## 💡 The Problem

### Merchants & Agencies Want AI to:

✅ Optimize product descriptions for ChatGPT Shopping (ACP)
✅ Fix missing GTIN/brand/weight fields
✅ Update pricing based on inventory
✅ Enrich metafields automatically
✅ Sync collections and tags

### But They Can't Because:

❌ **No visibility** – Can't see what AI is about to do
❌ **No control** – Can't set rules for what's auto-approved vs. requires review
❌ **No audit trail** – Can't prove to clients/stakeholders what changed
❌ **No financial bounds** – Can't cap the damage if AI goes rogue
❌ **No rollback** – Can't undo bad changes at scale

**Result**: AI gets turned off for the highest-ROI use cases because there's no governance layer.

---

## 🛡️ Our Solution

### Nobo: Governed AI for E-commerce

**A policy + audit layer that sits between AI agents and Shopify**

Merchants and agencies can finally run AI in production with:

**1. Policy Engine**
- Declarative rules for what AI can do automatically vs. what requires approval
- Example: "ACP metafield updates auto-approve if risk < 30"
- Example: "Public PDP title changes always escalate"

**2. Approval Queue**
- One unified inbox for all AI-proposed changes
- See before/after, approve/deny/bulk approve
- Works across multiple AI tools

**3. Audit Trail**
- Every AI action logged with timestamp, actor, before/after state
- Full rollback support
- Export for client reporting

**4. Financial Guardrails** *(Phase 2)*
- Stop-loss coverage for bad AI actions
- Per-agent spending caps
- Self-insured initially, underwriter partnership later

---

## 🎨 How It Works

### For Merchants

```
1. Connect Shopify store to Nobo
2. Set governance policies (one time)
   → "Auto-approve low-risk changes"
   → "Escalate pricing changes"
3. Run AI agents (ACP, inventory, pricing tools)
4. Review high-risk changes in Nobo approval queue
5. AI writes approved changes to Shopify
6. View audit log of all AI actions
```

### For Agencies

```
1. Connect Nobo once (manage all client stores)
2. Set agency-wide policy templates
3. Deploy AI to 10, 50, 100+ client stores
4. Review all client AI actions in one dashboard
5. Export audit reports per client
6. Upsell "governed AI" as premium service
```

### For AI Tool Vendors

```
1. Integrate Nobo SDK (< 100 lines of code)
2. Emit Nobo outcomes instead of writing directly to Shopify
3. Nobo handles policy check + approval + write-back
4. You get audit trail for free
5. Offer "enterprise-ready AI" to your customers
```

---

## 🚀 Product Vision

### Phase 1: Policy + Audit (Months 0-12)

**Core Features:**
- Nobo Policy Engine
- Approval Queue UI
- Shopify Connector (products, pricing, inventory, metafields)
- Agent SDK (for tool vendors)
- Audit Log + Export

**Target Customers:**
- Shopify agencies deploying AI to clients
- Shopify Plus merchants with in-house teams
- First 2-3 AI tool vendors (integration partners)

**Outcome:**
- 10-20 agencies managing 100+ merchant workspaces
- 100K+ AI actions governed and logged
- $500K-1M ARR

---

### Phase 2: Stop-Loss + Multi-Channel (Months 12-24)

**New Features:**
- Self-insured stop-loss coverage
  - "We'll cover up to $5K/mo of bad AI actions"
  - Priced at +$199-499/mo for coverage tier
- Support/CX vertical expansion
  - KB article governance (Zendesk, Gorgias, Intercom)
  - Same policy engine, different outcome types
- Enterprise features
  - RBAC, SSO, advanced audit, custom policy SDKs

**Target Customers:**
- Expand to support/CX agencies
- Mid-market/enterprise merchants needing compliance
- 5-10 AI tool vendors integrated

**Outcome:**
- 50-100 agencies, 500+ merchant workspaces
- 1M+ AI actions governed
- Loss data for insurance underwriting
- $3-5M ARR

---

### Phase 3: Full Insurance + Multi-Vertical (Months 24-36)

**New Features:**
- Full insurance partnership
  - Underwritten by insurance company (we've proven loss model)
  - Coverage tiers: $10K, $25K, $50K, $100K per month
- CRM/RevOps vertical
  - HubSpot, Salesforce governance
  - Lead/deal/pipeline AI actions
- API marketplace
  - 3rd-party policy packs
  - Custom integrations

**Target Customers:**
- Enterprise (1K+ products, multi-store)
- Agencies with 50+ clients
- 20+ AI tool vendors

**Outcome:**
- $10-20M ARR
- Series A fundraise ($20-30M valuation)

---

## 💰 Business Model

### Revenue Streams

**1. SaaS Subscriptions** (Primary)

| Customer Type | Price/Month | What's Included |
|--------------|-------------|-----------------|
| **Merchant** (Starter) | $99 | 1 store, 10K actions/mo, policy engine, audit |
| **Merchant** (Plus) | $299 | 1 store, 50K actions/mo, advanced policies, rollback |
| **Merchant** (Enterprise) | $999+ | Multi-store, unlimited actions, RBAC, SSO |
| **Agency** (Base) | $299 | Manage up to 10 client stores |
| **Agency** (Growth) | $799 | Manage up to 50 client stores |
| **Agency** (Enterprise) | $1,999+ | 100+ stores, white-label, priority support |

**2. Per-Action Fees** (High-risk actions only)
- Pricing changes: $0.05 per action
- Bulk updates (>100 products): $0.02 per product
- API usage (for tool vendors): $0.01 per outcome

**3. Stop-Loss Coverage** *(Phase 2)*
- +$199/mo for $5K coverage
- +$499/mo for $15K coverage
- +$999/mo for $50K coverage

**4. Professional Services**
- Custom policy pack setup: $2-5K one-time
- White-label deployment (agencies): $10-25K one-time
- Training & onboarding: $1-3K per agency

---

## 📈 Unit Economics

### Merchant Customer (Average)

**Assumptions:**
- Monthly subscription: $299 (Plus plan)
- Per-action revenue: ~$20/mo (avg 500 high-risk actions @ $0.04)
- **Total MRR**: $319

**Costs:**
- Infrastructure (AWS, Shopify API): $15/mo
- Support (10% of customers need help): $20/mo
- **Gross Margin**: 89%

**Customer Acquisition:**
- CAC: $800 (via agency channel)
- Payback period: 2.5 months
- LTV (36-month retention): $11,484
- **LTV/CAC**: 14.4x

---

### Agency Customer (Average)

**Assumptions:**
- Monthly subscription: $799 (Growth plan, 30 client stores)
- Per-store action fees: ~$15/store × 30 = $450/mo
- Professional services: $3K one-time onboarding
- **First-year revenue**: $18,588
- **Ongoing MRR**: $1,249

**Costs:**
- Infrastructure: $50/mo
- Support & success: $150/mo (agencies need white-glove)
- **Gross Margin**: 84%

**Customer Acquisition:**
- CAC: $3,500 (direct sales + onboarding)
- Payback period: 2.8 months
- LTV (48-month retention, agencies stick): $59,952
- **LTV/CAC**: 17.1x

---

## 🎯 Go-To-Market Strategy

### Year 1: Land & Expand via Agencies

**Why Agencies First?**
- Each agency manages 10-100 merchant stores
- 1 agency sale = 20-50 merchant workspaces under governance
- Agencies are motivated to upsell "governed AI" to clients
- Faster path to 100+ workspaces than direct merchant sales

**Channel Strategy:**

**1. Founder-Led Sales (Months 0-6)**
- Start with existing 50+ ACP customers
  - Offer Nobo as "upgrade to governed ACP"
  - Conversion target: 20% → 10 early adopters
- Target top 50 Shopify agencies via LinkedIn/email outreach
  - Personalized demos focusing on "AI as a service" positioning
  - Conversion target: 10% → 5 agencies

**2. Partnership with AI Tool Vendors (Months 3-9)**
- Recruit 2-3 Shopify AI app builders
  - Offer: "Add enterprise governance to your app"
  - They integrate Nobo SDK, we handle policy + audit
- Co-marketing: joint webinars, case studies
- Revenue share: 20% of subscription for referred customers

**3. Content Marketing (Months 6-12)**
- Publish "State of AI Governance in E-commerce 2025" report
- Host monthly webinars: "How to Deploy AI Safely in Shopify"
- SEO: target "Shopify AI governance," "ACP compliance," "AI audit trail"

**4. Shopify App Store Listing (Month 9)**
- Launch Nobo as Shopify app
- PLG motion for small merchants ($99/mo self-serve)
- Capture inbound, upsell to agency partners

---

### Year 2: Enterprise + Multi-Vertical

**Enterprise Direct Sales:**
- Hire 2 enterprise AEs (Month 12)
- Target Shopify Plus merchants with 1K+ products
- Average deal size: $2-5K/mo
- Sales cycle: 60-90 days

**Multi-Vertical Expansion:**
- Support/CX agencies (similar to e-commerce agencies)
- Same GTM playbook, different vertical
- TAM expansion: +30K support agencies

---

## 🏆 Competitive Landscape

### Direct Competitors: None *(yet)*

**No one is doing AI governance for e-commerce specifically.**

**Closest players:**

| Company | What They Do | Why We're Different |
|---------|-------------|---------------------|
| **LangSmith** | LLM observability | No policy enforcement, no cross-vendor outcomes |
| **Vellum** | LLM ops platform | Developer-focused, not business-user governance |
| **Shopify Flow** | Shopify automation | No AI governance, no audit for agent actions |
| **Zapier/Make** | Workflow automation | No AI-specific policy, no approval queue for agents |

---

### Potential Future Competitors

**1. Shopify Builds This Internally**
- **Risk**: Medium (12-24 months out)
- **Mitigation**:
  - We're cross-vendor (work with any Shopify app, not just Shopify's AI)
  - We expand beyond Shopify (support, CRM) before they catch up
  - Agency channel gives us distribution moat

**2. Enterprise Security Vendors (Palo Alto, CrowdStrike)**
- **Risk**: Low (not focused on e-commerce)
- **Mitigation**:
  - We own domain-specific outcome schemas
  - Deep Shopify integrations they won't build
  - Faster iteration for SMB/mid-market

**3. Compliance/GRC Tools (Vanta, Drata)**
- **Risk**: Low-Medium (could add AI governance module)
- **Mitigation**:
  - We're action-level governance, not compliance posture
  - We have operational workflows (approval queue), not just audit
  - Insurance differentiation

---

### Defensibility

**What makes Nobo hard to replicate?**

**1. Schema Moat** (Network Effects)
- More agents emit Nobo outcomes → more valuable to customers
- Switching cost increases as policies encode business logic

**2. Integration Depth**
- Shopify write-backs are complex (variants, metafields, collections)
- We own the "last mile" of AI → system connectivity

**3. Insurance Underwriting Data** *(Phase 2+)*
- We'll have 12-18 months of loss data before anyone else
- Enables better risk pricing, exclusive insurance partnerships

**4. Agency Distribution**
- Once agencies deploy us to 50+ clients, they won't rip-and-replace
- Channel lock-in

---

## 👥 Team

### Founders

**[Your Name]** — CEO
- Built [ACP Product Name] from 0 → 50+ paying customers
- Deep domain expertise in Shopify ecosystem + AI commerce
- Previously: [relevant experience]

**[Co-founder / Founding Engineer]** — CTO
- [Engineering background]
- Expert in: AI systems, integration architecture, policy engines
- Previously: [relevant experience]

---

### Advisors / Investors (To Be Recruited)

**Target profiles:**
- Former Shopify executive (ecosystem knowledge)
- Insurance/risk expert (for Phase 2 stop-loss)
- Enterprise SaaS GTM operator (agency sales)

---

## 💵 The Ask

### Raising: $1.0M Seed

**Use of Funds (24-month runway):**

| Category | Amount | % |
|----------|--------|---|
| **Engineering** | $400K | 40% |
| Founding engineer (18 mo @ $180K) | $270K | |
| Contract frontend (12 mo @ $10K/mo) | $120K | |
| Infrastructure & tools | $10K | |
| **Sales & Marketing** | $200K | 20% |
| Founder salary (18 mo @ $120K) | $180K | |
| Marketing & events | $20K | |
| **Operations** | $150K | 15% |
| Legal, compliance, insurance | $80K | |
| Office & SaaS tools | $40K | |
| Recruiting & HR | $30K | |
| **Contingency & Reserves** | $250K | 25% |
| Self-insurance reserve (Phase 2) | $150K | |
| Buffer for bad hires, scope changes | $100K | |

---

### Milestones (18 Months)

**Month 6:**
- ✅ 5 agency customers managing 50+ merchant workspaces
- ✅ 2 AI tool vendor integrations live
- ✅ $30K MRR

**Month 12:**
- ✅ 15 agencies, 150+ workspaces
- ✅ 100K+ AI actions governed per month
- ✅ $100K MRR ($1.2M ARR run rate)

**Month 18:**
- ✅ 30 agencies, 300+ workspaces
- ✅ Stop-loss coverage launched (Phase 2)
- ✅ $200K MRR ($2.4M ARR run rate)
- ✅ **Series A ready** ($20-30M valuation)

---

## 📊 Financial Projections

### 3-Year Revenue Model

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Customers** | | | |
| Agencies | 20 | 60 | 120 |
| Avg workspaces/agency | 10 | 15 | 20 |
| Total workspaces | 200 | 900 | 2,400 |
| Direct merchants | 20 | 50 | 100 |
| **Revenue** | | | |
| Agency MRR (avg $1,000/mo) | $20K | $60K | $120K |
| Workspace MRR (avg $150/mo) | $30K | $135K | $360K |
| Direct merchant MRR (avg $300/mo) | $6K | $15K | $30K |
| **Total MRR** | **$56K** | **$210K** | **$510K** |
| **ARR** | **$672K** | **$2.52M** | **$6.12M** |
| **YoY Growth** | — | 275% | 143% |

### Path to Profitability

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | $672K | $2.52M | $6.12M |
| COGS (15%) | $101K | $378K | $918K |
| **Gross Profit** | $571K | $2.14M | $5.20M |
| **Gross Margin** | 85% | 85% | 85% |
| | | | |
| Sales & Marketing (50%) | $336K | $1.26M | $3.06M |
| R&D (30%) | $202K | $756K | $1.84M |
| G&A (15%) | $101K | $378K | $918K |
| **Operating Expenses** | $639K | $2.39M | $5.82M |
| | | | |
| **EBITDA** | -$68K | -$252K | -$622K |
| **EBITDA Margin** | -10% | -10% | -10% |

**Note**: Operating at slight loss to fuel growth. Path to profitability at $8-10M ARR (Year 4).

---

## 🎯 Why Now?

**Three Tailwinds Converging:**

**1. ChatGPT Shopping Launched** (Late 2024)
- Merchants scrambling to comply with ACP
- Catalog optimization AI tools exploding
- Governance gap is acute RIGHT NOW

**2. Enterprise AI Adoption Stalled**
- Every company wants to deploy agents
- Security/risk/legal teams are blocking it
- Whoever solves governance unlocks billions in AI spend

**3. Insurance Industry Watching AI Closely**
- No one has structured AI action data yet
- We'll be first to market with insurable AI outcomes
- 12-18 month head start on underwriting data

---

## 🏁 Closing

### The Big Picture

**Every business will run on AI agents in 3-5 years.**

**The company that standardizes AI actions—and makes them governable and insurable—becomes infrastructure.**

**We're not building a Shopify app.**

**We're building the rails that all AI agents run on.**

---

### Traction to Date

- ✅ 50+ paying customers for ACP product
- ✅ Deep Shopify ecosystem knowledge
- ✅ 3 design partners committed for Nobo beta
- ✅ 2 AI tool vendors interested in integration

---

### The Ask (Repeated)

**Raising**: $1.0M seed at $4M pre-money valuation

**Use**: 18-24 month runway to $1-2M ARR

**Outcome**: Series A ready at $20-30M valuation

---

### Let's Build the Future of Governed AI

**Contact:**
- [Your Name]
- [Email]
- [Phone]
- [Calendar Link]

---

*Nobo* · Governed AI for E-commerce

**Appendix Available:**
- Detailed financial model
- Product roadmap
- Go-to-market strategy
- Competitive deep dive
- Technical architecture
