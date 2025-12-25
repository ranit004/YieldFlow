# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Make sure you have a Vercel account and the project is connected to your GitHub repository.
2. **Vercel Postgres**: You need to set up a Vercel Postgres database for the project.

## Setup Steps

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard: https://vercel.com/ranitisking-gmailcoms-projects
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "Postgres"
4. Follow the prompts to create a new Postgres database
5. Once created, Vercel will automatically add the `DATABASE_URL` environment variable to your project

### 2. Push Database Schema

After the database is created, you need to push the schema:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Push database schema using Drizzle
npm run db:push
```

### 3. Seed the Database

After deploying, you need to seed the database with initial strategies:

```bash
# Call the seed endpoint (replace with your actual deployment URL)
curl -X POST https://yield-flow.vercel.app/api/seed
```

Or visit the URL in your browser: https://yield-flow.vercel.app/api/seed

### 4. Deploy to Vercel

The deployment should happen automatically when you push to GitHub. If you need to deploy manually:

```bash
vercel --prod
```

## API Endpoints

The following serverless functions are available:

- `GET /api/strategies` - List all strategies
- `PUT /api/strategies/:id` - Update a strategy
- `GET /api/deposits/:walletAddress` - Get deposits for a wallet
- `POST /api/deposits` - Create a new deposit
- `PATCH /api/deposits/:id` - Update deposit status
- `GET /api/solana/stats` - Get Solana network stats
- `GET /api/solana/feed` - Get Solana activity feed
- `POST /api/rebalance` - Execute rebalancing
- `POST /api/seed` - Seed the database (run once after deployment)

## Environment Variables

Required environment variables (automatically set by Vercel Postgres):

- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Make sure the Vercel Postgres database is created
2. Verify environment variables are set in Vercel dashboard
3. Run `npm run db:push` to ensure schema is up to date

### API Not Working

If API endpoints return 404:
1. Check that the `api/` directory is included in the deployment
2. Verify `vercel.json` configuration is correct
3. Check Vercel function logs in the dashboard

### Strategies Not Loading

If the strategies page shows "Error loading strategies":
1. Make sure you've seeded the database by calling `/api/seed`
2. Check the database has data by querying it in Vercel dashboard
3. Check function logs for errors
