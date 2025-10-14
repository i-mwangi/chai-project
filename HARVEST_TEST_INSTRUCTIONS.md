# Harvest Reporting Test Instructions

## The Problem
The harvest reporting was failing because the in-memory database doesn't properly handle complex queries with `and()` conditions.

## The Fix
Changed `DISABLE_INVESTOR_KYC=false` in `.env` to use the real SQLite database.

## How to Test

### Step 1: Stop the Current Server
- Find the terminal/window running `node api/server.ts`
- Press `Ctrl+C` to stop it

### Step 2: Start the Server with New Config
Open a terminal and run:
```bash
tsx api/server.ts
```

Or use the npm script:
```bash
npm run api
```

Wait until you see:
```
Coffee Tree Platform API server running on port 3001
```

### Step 3: Run the Test
Open a **NEW** terminal (keep the server running) and run:
```bash
node test-harvest-reporting.cjs
```

### Expected Result
You should see:
```
Registering grove...
Grove registration response: {"success":true,...}

Testing harvest reporting...
Harvest reporting response: {"success":true,"message":"Harvest reported successfully",...}
```

## What Changed
- ✅ Using real SQLite database (better query support)
- ✅ Farmer verification still disabled (auto-approved)
- ✅ Complex `and()` queries now work properly

## If It Still Fails
1. Make sure the server restarted (check the terminal for startup message)
2. Check `.env` has `DISABLE_INVESTOR_KYC=false`
3. Verify `better-sqlite3` is installed: `npm list better-sqlite3`
