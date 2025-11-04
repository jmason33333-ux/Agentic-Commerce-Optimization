# Deployment Guide

Complete guide for deploying the Agentic Commerce Setup Platform to production.

## 📋 Pre-Deployment Checklist

### 1. Required Accounts

- [ ] **GitHub** - Code repository
- [ ] **Vercel** - Hosting platform (recommended)
- [ ] **PostgreSQL Database** - Vercel Postgres, Railway, or Supabase
- [ ] **Upstash Redis** - Free tier sufficient for MVP
- [ ] **Shopify Partner Account** - For OAuth app credentials
- [ ] **Sentry** - (Optional) Error monitoring
- [ ] **Domain Name** - (Optional) Custom domain

### 2. Environment Variables Ready

Prepare these values before deployment:

```bash
# Generate encryption key locally
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32
```

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Ensure code is committed
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New... → Project**
3. Import your GitHub repository
4. Select **Framework Preset**: Next.js
5. Keep default settings (Root Directory: `./`, Build Command: `next build`)

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Core Configuration

```bash
# App Configuration
APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

#### Security (CRITICAL)

```bash
# Encryption - 64 hex characters
ENCRYPTION_KEY=your-64-char-hex-key-here

# Rate Limiting - Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Error Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Shopify OAuth

```bash
SHOPIFY_CLIENT_ID=your-shopify-client-id
SHOPIFY_CLIENT_SECRET=your-shopify-client-secret
SHOPIFY_REDIRECT_URI=https://your-domain.vercel.app/api/auth/shopify/callback
SHOPIFY_API_VERSION=2025-01
```

#### Email (for Auth)

```bash
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-resend-api-key
EMAIL_FROM=noreply@your-domain.com
```

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Vercel will run: `npm install` → `npx prisma generate` → `npm run build`

### Step 5: Run Database Migrations

```bash
# Connect to production database
export DATABASE_URL="your-production-db-url"

# Run migrations
npx prisma migrate deploy

# Or push schema (for quick setup)
npx prisma db push
```

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "latency_ms": 42 },
    "redis": { "status": "ok" },
    "env_vars": { "status": "ok", "missing": [] }
  },
  "uptime": 123.45
}
```

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Easiest)

1. Go to Vercel Dashboard → Storage → Create Database
2. Select **Postgres**
3. Choose region closest to your users
4. Click **Create**
5. Copy connection string (starts with `postgres://...`)
6. Add to environment variables as `DATABASE_URL`

**Note**: Vercel Postgres includes connection pooling automatically.

### Option 2: Railway

1. Create new project at [railway.app](https://railway.app)
2. Add **PostgreSQL** service
3. Copy `DATABASE_URL` from Variables tab
4. Add `?sslmode=require` to connection string

### Option 3: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy **Connection Pooling** string (recommended for serverless)
4. Format: `postgresql://postgres.xxx:password@aws-xxx.pooler.supabase.com:5432/postgres`

## 🔴 Redis Setup (Upstash)

### Step 1: Create Database

1. Go to [console.upstash.com](https://console.upstash.com)
2. Click **Create Database**
3. Name: `agentic-commerce-rate-limiting`
4. Type: **Regional** (cheaper than Global)
5. Region: Same as your Vercel deployment
6. Click **Create**

### Step 2: Get Credentials

1. Click on database name
2. Scroll to **REST API** section
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add to Vercel environment variables

### Step 3: Verify Connection

```bash
# Test Redis from your local machine
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Expected: {"result":"PONG"}
```

## 🏪 Shopify OAuth Setup

### Step 1: Create Shopify App

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Apps → **Create app** → **Create app manually**
3. App name: "Agentic Commerce Setup"
4. App URL: `https://your-domain.vercel.app`

### Step 2: Configure OAuth

1. Go to **Configuration** → **App setup**
2. **Allowed redirection URL(s)**:
   ```
   https://your-domain.vercel.app/api/auth/shopify/callback
   ```
3. **App Proxy** (optional for embedded apps):
   - Subpath prefix: `apps`
   - Subpath: `agentic-commerce`
   - Proxy URL: `https://your-domain.vercel.app/api/proxy`

### Step 3: Request Scopes

1. Go to **Configuration** → **API access**
2. Request the following scopes:
   ```
   read_products
   write_products
   read_orders
   read_merchant_managed_fulfillment_orders
   ```

### Step 4: Get Credentials

1. Go to **Configuration** → **Client credentials**
2. Copy:
   - **Client ID** → `SHOPIFY_CLIENT_ID`
   - **Client secret** → `SHOPIFY_CLIENT_SECRET`
3. Add to Vercel environment variables

## 📧 Email Setup (Magic Links)

### Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Configure domain (or use `onboarding@resend.dev` for testing)
4. Environment variables:
   ```bash
   EMAIL_SERVER_HOST=smtp.resend.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=resend
   EMAIL_SERVER_PASSWORD=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

### SendGrid Alternative

```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## 🔔 Monitoring Setup

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Copy DSN from Settings → Client Keys
3. Add to Vercel:
   ```bash
   SENTRY_DSN=https://xxx@sentry.io/123456
   ```

Errors are automatically captured with PII scrubbing.

### Health Check Monitoring

Configure uptime monitoring with [UptimeRobot](https://uptimerobot.com) (free):

1. Create new monitor
2. Monitor Type: **HTTP(s)**
3. URL: `https://your-domain.vercel.app/api/health`
4. Monitoring Interval: **5 minutes**
5. Alert Contacts: Your email/SMS

Expected response status: `200 OK`

### Vercel Analytics

Enable in Vercel Dashboard:
1. Project → Analytics → Enable
2. Track page views, Web Vitals, and audience

## 🔒 Security Post-Deployment

### 1. Rotate Encryption Key (Every 90 Days)

```bash
# Generate new key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create rotation script
npx tsx scripts/rotate-keys.ts --old-key $OLD_KEY --new-key $NEW_KEY

# Update environment variable in Vercel
# Redeploy
```

### 2. Monitor Rate Limits

Check Upstash console for:
- Spike in `feed:*` keys (feed submission abuse)
- Spike in `auth:*` keys (brute force attempts)
- Spike in `toggle:*` keys (automated scripts)

### 3. Review Security Logs

Check Sentry for:
- Failed decryption attempts
- Rate limit violations
- Unauthorized access attempts

### 4. Environment Variable Audit

```bash
# Check all required variables are set
curl https://your-domain.vercel.app/api/health | jq '.checks.env_vars'

# Expected: { "status": "ok", "missing": [] }
```

## 🌐 Custom Domain Setup

### Step 1: Add Domain to Vercel

1. Project → Settings → Domains
2. Add your domain: `agentic-commerce.com`
3. Vercel provides DNS records

### Step 2: Configure DNS

Add these records to your DNS provider:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Step 3: Update Environment Variables

Update these variables with new domain:
```bash
NEXTAUTH_URL=https://agentic-commerce.com
NEXT_PUBLIC_APP_URL=https://agentic-commerce.com
SHOPIFY_REDIRECT_URI=https://agentic-commerce.com/api/auth/shopify/callback
```

### Step 4: Update Shopify App

Update redirect URL in Shopify Partner dashboard to match new domain.

## 🐛 Troubleshooting

### Build Fails: "Cannot find module '@prisma/client'"

**Solution**: Ensure `prisma generate` runs during build:

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Runtime Error: "ENCRYPTION_KEY must be 64 characters"

**Solution**: Verify encryption key in Vercel:
```bash
# Key must be exactly 64 hex characters (32 bytes)
echo $ENCRYPTION_KEY | wc -c
# Should output: 65 (64 chars + newline)
```

### Rate Limiting Not Working

**Check**:
1. `UPSTASH_REDIS_REST_URL` is set correctly
2. Redis database is in same region as Vercel deployment
3. No console warnings about Redis connection

### Shopify OAuth Fails: "Redirect URI mismatch"

**Solution**: Ensure exact match:
- Vercel env: `https://your-domain.vercel.app/api/auth/shopify/callback`
- Shopify dashboard: `https://your-domain.vercel.app/api/auth/shopify/callback`
- Include `/api/auth/shopify/callback` path
- Use `https://` (not `http://`)

### Database Connection Timeout

**Solution**: Use connection pooling:
```bash
# Bad (direct connection)
DATABASE_URL=postgres://user:pass@host:5432/db

# Good (with pooling)
DATABASE_URL=postgres://user:pass@host:5432/db?pgbouncer=true&connection_limit=10
```

For Supabase, use the **Connection Pooling** string, not direct connection.

## 📊 Performance Optimization

### Database Indexing

```sql
-- Run these indexes for better performance
CREATE INDEX idx_workspace_shopify ON "Workspace"("shopifyDomain");
CREATE INDEX idx_product_workspace ON "Product"("workspaceId");
CREATE INDEX idx_product_enabled ON "Product"("enableSearch", "enableCheckout");
CREATE INDEX idx_checkout_session_workspace ON "CheckoutSession"("workspaceId");
CREATE INDEX idx_order_event_workspace ON "OrderEvent"("workspaceId");
```

### CDN & Caching

Vercel automatically provides:
- Edge caching for static assets
- Image optimization
- Automatic compression

API routes are not cached by default (correct for our use case).

### Database Connection Pooling

If using Prisma directly:

```typescript
// src/server/db.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys on:
- **main branch** → Production
- **Pull requests** → Preview deployments

### Pre-Deployment Checks

```bash
# Run locally before pushing
npm run lint           # Lint code
npm run type-check     # TypeScript validation
npx prisma validate    # Prisma schema validation
npm run build          # Build check
```

### Deployment Hooks

Set up webhooks in Vercel:
1. Settings → Git → Deploy Hooks
2. Create hook for `main` branch
3. Use webhook URL to trigger deploys from CI/CD

## 📈 Scaling Considerations

### When to Upgrade

**Free Tier Limits**:
- Vercel: 100GB bandwidth/month
- Upstash: 10K commands/day
- Sentry: 5K errors/month

**Upgrade triggers**:
- 100+ merchants onboarded
- 1K+ feed submissions/day
- Database connections maxed out

### Horizontal Scaling

Vercel auto-scales serverless functions. No action required.

### Database Scaling

**Vertical scaling** (increase resources):
- Vercel Postgres: Upgrade plan in dashboard
- Railway: Increase CPU/RAM in settings
- Supabase: Upgrade to Pro plan

**Connection pooling** (recommended at 50+ merchants):
- Use Prisma Data Proxy or PgBouncer
- Set `connection_limit=10` in `DATABASE_URL`

## 🚨 Disaster Recovery

### Backup Strategy

**Database backups**:
- Vercel Postgres: Automatic daily backups (retained 7 days)
- Railway: Automatic backups on Pro plan
- Supabase: Automatic daily backups

**Manual backup**:
```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20250115.sql
```

### Rollback Procedure

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click ⋮ → **Promote to Production**

### Emergency Contacts

Document these for your team:
- Vercel support: [vercel.com/help](https://vercel.com/help)
- Database provider support
- On-call engineer contact info

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Database migrations applied successfully
- [ ] All environment variables set correctly
- [ ] Shopify OAuth flow works end-to-end
- [ ] Feed submission completes without errors
- [ ] Checkout session creation works
- [ ] Email magic links arrive in inbox
- [ ] Rate limiting works (test with rapid requests)
- [ ] Error monitoring captures test error
- [ ] Custom domain resolves correctly (if applicable)
- [ ] SSL certificate active
- [ ] Uptime monitoring configured
- [ ] Team members can access admin dashboard

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Review Sentry error reports
- Check uptime monitoring alerts
- Review Vercel usage metrics

**Monthly**:
- Review and rotate API keys if needed
- Update dependencies (`npm update`)
- Review database performance metrics

**Quarterly**:
- Rotate encryption key
- Review security logs
- Performance audit

### Getting Help

- **Documentation**: `MVP-MERGE-STRATEGY.md`
- **GitHub Issues**: Report bugs and request features
- **Discord/Slack**: Join community (if available)

---

**Deployment complete!** 🎉

Your platform is now live and ready to onboard merchants to ChatGPT commerce.
