# Setup Guide

This guide will walk you through setting up Agent Commerce SEO from scratch.

## Step 1: Database Setup

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the `DATABASE_URL` from the Connect tab
5. Paste into your `.env` file

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Transaction mode)
5. Paste into your `.env` file

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Ubuntu

# Create database
createdb agent_commerce_seo

# Your DATABASE_URL:
DATABASE_URL="postgresql://localhost:5432/agent_commerce_seo"
```

## Step 2: Email Setup (for Magic Links)

### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Configure in `.env`:

```env
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Option B: SendGrid

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Option C: Gmail (Dev Only)

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-gmail@gmail.com"
EMAIL_SERVER_PASSWORD="app-specific-password"
EMAIL_FROM="your-gmail@gmail.com"
```

**Note**: You need to enable 2FA and create an app-specific password.

## Step 3: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env`:

```env
OPENAI_API_KEY="sk-..."
LLM_MODEL="gpt-4o-mini"
```

## Step 4: NextAuth Secret

Generate a secure secret:

```bash
openssl rand -base64 32
```

Add to `.env`:

```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 5: Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

## Step 6: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Create Your First User

Since magic links require email setup, you can manually create a user in the database:

```bash
npm run db:studio
```

1. Open Prisma Studio
2. Go to `User` table
3. Click "Add record"
4. Fill in:
   - `email`: your email
   - `emailVerified`: current timestamp
   - `role`: `ADMIN`

## Step 8: Connect Shopify

### Create a Shopify Custom App

1. In Shopify Admin, go to **Settings → Apps and sales channels**
2. Click **Develop apps** (may need to enable)
3. Click **Create an app**
4. Name it "Agent Commerce SEO"
5. Go to **Configuration** tab
6. Under **Admin API integration**, click **Configure**
7. Select scopes:
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `read_product_listings`
   - ✅ `write_metafields`
   - ✅ `read_orders`
8. Click **Save**
9. Go to **API credentials** tab
10. Click **Install app**
11. Copy the **Admin API access token** (starts with `shpat_`)

### Connect in App

1. Create a workspace
2. Click "Connect Shopify"
3. Enter:
   - Shop Domain: `your-store.myshopify.com`
   - Access Token: `shpat_...`

## Step 9: Test the Flow

1. **Sync Products**: Click "Sync Products" to fetch from Shopify
2. **Run Audit**: Click "Run Audit" to analyze products
3. **Review Suggestions**: Go to Suggestions page
4. **Approve**: Approve a low-risk suggestion
5. **Apply**: Click "Apply" to write back to Shopify

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npm run db:studio
```

If it fails, check:
- DATABASE_URL is correct
- Database is running
- Firewall allows connection

### Email Not Sending

Test with a simple SMTP tool first. Common issues:
- Wrong credentials
- Port blocked by firewall
- Need app-specific password (Gmail)

### Shopify API Errors

Check:
- Access token is correct
- Scopes are configured
- API rate limits not exceeded

### LLM Not Working

Verify:
- OPENAI_API_KEY is set
- You have API credits
- Network can reach api.openai.com

## Production Deployment

### Environment Variables Checklist

- [ ] `DATABASE_URL` (production database)
- [ ] `NEXTAUTH_SECRET` (new secret, not dev)
- [ ] `NEXTAUTH_URL` (production URL)
- [ ] `EMAIL_SERVER_*` (production email)
- [ ] `OPENAI_API_KEY`
- [ ] `APP_URL` (for webhooks)

### Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Set env vars
4. Deploy

Auto-deploys on push to main.

### Database Migration

Before deploying:

```bash
# Create migration
npm run db:migrate

# Commit migration files
git add prisma/migrations
git commit -m "Add database migration"
```

## Next Steps

- Set up Shopify webhooks for real-time order tracking
- Configure workspace auto-apply settings
- Invite team members
- Customize LLM prompts
- Build out analytics

## Getting Help

- Check the [README](./README.md) for API docs
- Open an issue on GitHub
- Review Prisma schema for data model

Happy optimizing! 🚀
