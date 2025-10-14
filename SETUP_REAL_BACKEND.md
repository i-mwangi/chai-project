# Setup Guide: Using Real Backend API for Primary Market Investment

## The Issue

The frontend mock server (`frontend/api-server.js`) was intercepting investment API calls and using in-memory storage instead of the real database. This meant purchases weren't being persisted and portfolios weren't showing real data.

## The Solution

I've updated the frontend mock server to proxy investment API calls to the real backend API. Now purchases will be stored in the database and portfolios will show real data.

## Setup Steps

### Option 1: Run Both Servers (Recommended)

1. **Start the Real Backend API Server** (Port 3001):
   ```bash
   # In terminal 1
   npm run start
   # OR if you have a specific backend start command:
   node api/server.ts
   # OR
   tsx api/server.ts
   ```

2. **Start the Frontend Mock Server** (Port 3002):
   ```bash
   # In terminal 2
   node frontend/api-server.js
   ```

3. **Access the Frontend**:
   - Open your browser to the frontend URL (usually `http://localhost:3000` or wherever your frontend is served)
   - The frontend will call port 3002 (mock server)
   - The mock server will proxy investment calls to port 3001 (real backend)
   - Purchases will be stored in the database
   - Portfolio will show real data from the database

### Option 2: Use Only Real Backend (Alternative)

If you want to skip the mock server entirely:

1. **Update Frontend API Base URL**:
   - Edit `frontend/js/api.js`
   - Change `baseURL` from `http://localhost:3002` to `http://localhost:3001`

2. **Start Only the Real Backend**:
   ```bash
   npm run start
   # OR
   tsx api/server.ts
   ```

3. **Note**: Some mock endpoints might not be available on the real backend

## Verification

To verify everything is working:

1. **Run the test script**:
   ```bash
   npx tsx test-investment-endpoints.ts
   ```

2. **Expected output**:
   ```
   🧪 Testing Investment Endpoints...
   
   1️⃣ Registering a test grove...
      Grove registration: ✅ Success
   
   2️⃣ Getting grove ID...
      ✅ Found grove with ID: X
   
   3️⃣ Purchasing tokens...
      Purchase: ✅ Success
      Details: { tokens: 10, price: '$25', total: '$250' }
   
   4️⃣ Fetching portfolio...
      Portfolio: ✅ Success
      Holdings: 1
      Total Investment: $250
      Total Tokens: 10
   
   ✅ All tests completed successfully!
   ```

## Testing in the UI

1. **As a Farmer**:
   - Register a grove
   - Note the grove name

2. **As an Investor**:
   - Go to "Available Groves"
   - Find your grove
   - Click "Invest"
   - Enter token amount (e.g., 10)
   - Click "Purchase"
   - You should see a success message

3. **Check Portfolio**:
   - Go to "My Portfolio"
   - You should see your purchase listed with:
     - Grove name
     - Token amount
     - Purchase price
     - Location
     - Coffee variety
     - Total investment

## Troubleshooting

### "Cannot connect" or "Failed to fetch" errors

**Problem**: Backend server is not running

**Solution**: Start the backend server on port 3001:
```bash
tsx api/server.ts
```

### Portfolio shows old mock data

**Problem**: Browser cache or frontend is still using old mock server

**Solution**:
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Restart both servers

### Purchases not appearing in portfolio

**Problem**: Backend database might not be initialized

**Solution**:
1. Check if the database file exists
2. Run database migrations if needed:
   ```bash
   npm run migrate
   ```

### Port already in use

**Problem**: Another process is using port 3001 or 3002

**Solution**:
1. Find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :3001
   kill -9 <PID>
   ```

2. Or use different ports by setting environment variables:
   ```bash
   API_PORT=3003 node api/server.ts
   ```

## Environment Variables

You can configure ports using environment variables:

```bash
# Backend API port (default: 3001)
export API_PORT=3001

# Frontend mock server port (default: 3002)
# (Set in frontend/api-server.js)

# Backend port for proxy (default: 3001)
export BACKEND_PORT=3001
```

## What's Changed

### Files Modified:

1. **`api/investment-api.ts`** (NEW)
   - Real implementation of purchase and portfolio endpoints
   - Stores data in SQLite database via Drizzle ORM

2. **`api/server.ts`** (UPDATED)
   - Added routes for `/api/investment/purchase-tokens` and `/api/investment/portfolio`

3. **`frontend/api-server.js`** (UPDATED)
   - Now proxies investment calls to real backend
   - Falls back to mock implementation if backend is unavailable

4. **`db/schema/index.ts`** (UPDATED)
   - Added indexes to `tokenHoldings` table for better performance

## Success!

Once both servers are running, your primary market investments will:
- ✅ Be stored in the database
- ✅ Persist across server restarts
- ✅ Show up in your portfolio
- ✅ Be available for revenue distributions
- ✅ Be compatible with secondary marketplace

Enjoy your fully functional primary market! 🎉
