# Vercel Deployment Fix

## Problem
You were getting this error when deploying to Vercel:
```
Error: No Output Directory named "public" found after the Build completed.
```

## Root Cause
Vercel was looking for a `public` directory at the root level, but your project structure has:
- Frontend files in `frontend/` directory
- Public assets in `frontend/public/` directory
- API files in `api/` directory

## Solution Applied

### 1. Created `vercel.json` Configuration
This file tells Vercel:
- **Output Directory**: `frontend` (where your HTML files are)
- **Build Command**: `pnpm build` (compiles TypeScript to dist/)
- **Routes**: Maps URLs to correct files
  - `/api/*` → API server
  - `/public/*` → frontend/public assets
  - `/js/*` → frontend/js files
  - `/styles/*` → frontend/styles
  - `/` → frontend/index.html

### 2. Created `.vercelignore`
Excludes unnecessary files from deployment:
- Test files
- Local database
- Development scripts
- Backup files
- Documentation

## Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect `vercel.json`
5. Click "Deploy"

## Environment Variables
Don't forget to add these in Vercel Dashboard → Settings → Environment Variables:

### Required:
- `HEDERA_NETWORK` = testnet
- `HEDERA_OPERATOR_ID` = 0.0.6967933
- `HEDERA_OPERATOR_KEY` = your-private-key
- `DATABASE_URL` = (Vercel will need a hosted database)

### Optional (for full functionality):
- `USDC_TOKEN_ID`
- `ISSUER_CONTRACT_ID`
- `LENDER_CONTRACT_ID`
- `REVENUE_RESERVE_CONTRACT_ID`
- `ADMIN_ACCOUNT_ID`
- `ADMIN_TOKEN`

## Important Notes

### Database Consideration
Your current setup uses SQLite (`file:./local-store/sqlite/sqlite.db`), which won't work on Vercel's serverless environment. You'll need to:

**Option A: Use Vercel Postgres**
```bash
# Install Vercel Postgres
vercel postgres create
```

**Option B: Use Turso (LibSQL)**
```bash
# Already have @libsql/client installed
# Just update DATABASE_URL to Turso connection string
```

**Option C: Use Supabase**
- Free tier available
- PostgreSQL compatible
- Works with Drizzle ORM

### API Server Consideration
The API server (`api/server.ts`) needs to be adapted for serverless:
- Each API route should be a separate serverless function
- Or use Vercel's Node.js runtime with proper routing

## Testing Deployment

After deployment:
1. Check the frontend loads: `https://your-app.vercel.app`
2. Test API endpoints: `https://your-app.vercel.app/api/health`
3. Check browser console for errors
4. Verify environment variables are set

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `pnpm build`

### API Routes Don't Work
- Check function logs in Vercel dashboard
- Verify environment variables are set
- Check CORS headers in `vercel.json`

### Static Files Not Loading
- Verify paths in `vercel.json` routes
- Check browser network tab for 404s
- Ensure files exist in `frontend/` directory

## Next Steps

1. **Deploy to Vercel** using one of the methods above
2. **Set up database** (choose Option A, B, or C)
3. **Configure environment variables** in Vercel dashboard
4. **Test the deployment** thoroughly
5. **Set up custom domain** (optional)

## Files Created
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ This documentation file

Your project is now ready for Vercel deployment! 🚀
