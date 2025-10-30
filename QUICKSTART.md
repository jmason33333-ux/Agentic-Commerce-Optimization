# Quick Start Guide

Get Agent Commerce SEO running in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL database (or use Railway/Supabase free tier)
- OpenAI API key

## 1. Clone & Install

```bash
git clone https://github.com/jmason33333-ux/Agentic-Commerce-Optimization.git
cd Agentic-Commerce-Optimization
npm install
```

## 2. Set Up Database

**Option A: Railway (Easiest)**

1. Visit [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy `DATABASE_URL`

**Option B: Local**

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb agent_commerce_seo

# Ubuntu
sudo apt install postgresql
sudo service postgresql start
sudo -u postgres createdb agent_commerce_seo
```

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with minimal config:

```env
# Database (from Railway or local)
DATABASE_URL="postgresql://..."

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Email (optional for dev - skip magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## 4. Initialize Database

```bash
npm run db:push
```

## 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Create First User (Manual)

Since email might not be configured:

```bash
npm run db:studio
```

In Prisma Studio:
1. Go to `User` table
2. Add record:
   - email: `you@example.com`
   - emailVerified: `2024-01-01T00:00:00.000Z`
   - role: `ADMIN`

## 7. Get Shopify Token

1. Shopify Admin → Settings → Apps and sales channels
2. Develop apps → Create an app
3. Configure Admin API:
   - ✅ read_products
   - ✅ write_products
   - ✅ write_metafields
   - ✅ read_orders
4. Install app
5. Copy Admin API access token

## 8. Test the Flow

1. **Create workspace** in the app
2. **Connect Shopify** with token
3. **Sync products** (wait for job to complete)
4. **Run audit** (generates AI suggestions)
5. **Review suggestions**
6. **Approve & apply**

## Troubleshooting

**Can't connect to database?**
```bash
# Test connection
npm run db:studio
```

**OpenAI errors?**
- Check API key is correct
- Verify you have credits
- Check network connectivity

**No products syncing?**
- Verify Shopify token
- Check API scopes
- Look at job status in `/api/jobs`

**Need help?**
- See full [SETUP.md](./SETUP.md)
- Check [README.md](./README.md)
- Open a GitHub issue

## Next Steps

- Configure email for magic link auth
- Set up Shopify webhooks for order tracking
- Explore the API documentation
- Build out the suggestions queue UI
- Deploy to Vercel

🚀 You're ready to optimize for agentic commerce!
