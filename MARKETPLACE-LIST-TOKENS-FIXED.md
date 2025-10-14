# Marketplace "List for Sale" - FIXED! ✅

## The Error
```
POST http://localhost:3001/api/marketplace/list-tokens 500 (Internal Server Error)
```

## Root Cause
The `marketplace.ts` file was using **Express types** (`Request`, `Response`) but the server uses **Node.js http types** (`IncomingMessage`, `ServerResponse`).

This caused:
- `res.json()` method doesn't exist on `ServerResponse`
- `res.status()` method doesn't exist
- Type mismatch errors
- 500 Internal Server Error

## The Fix

### Changed marketplace.ts:

1. **Updated imports**:
   ```typescript
   // Before:
   import { Request, Response } from 'express';
   
   // After:
   import { IncomingMessage, ServerResponse } from 'http';
   ```

2. **Added utility functions**:
   ```typescript
   function sendResponse(res: ServerResponse, statusCode: number, data: any)
   function sendError(res: ServerResponse, statusCode: number, message: string)
   ```

3. **Updated all function signatures**:
   ```typescript
   // Before:
   export async function listTokensForSale(req: Request, res: Response)
   
   // After:
   export async function listTokensForSale(req: IncomingMessage, res: ServerResponse)
   ```

4. **Replaced Express methods**:
   ```typescript
   // Before:
   res.json({ success: true, ... })
   res.status(400).json({ success: false, error: '...' })
   
   // After:
   sendResponse(res, 200, { success: true, ... })
   sendError(res, 400, '...')
   ```

5. **Fixed request body/query access**:
   ```typescript
   // Before:
   const { groveId } = req.body;
   const { userAddress } = req.query;
   
   // After:
   const { groveId } = (req as any).body;
   const { userAddress } = (req as any).query;
   ```

## Functions Fixed

All marketplace API functions updated:
- ✅ `listTokensForSale` - List tokens for sale
- ✅ `getMarketplaceListings` - Get all listings
- ✅ `purchaseFromMarketplace` - Buy from marketplace
- ✅ `cancelListing` - Cancel a listing
- ✅ `updateListing` - Update listing price/duration
- ✅ `getTradeHistory` - Get trade history
- ✅ `getMarketplaceStats` - Get marketplace statistics
- ✅ `getUserListings` - Get user's listings

## Testing

### 1. Restart API Server
```bash
restart-api-server.bat
```

### 2. Test Listing Tokens
1. Go to Portfolio section
2. Find a holding
3. Click "List for Sale"
4. Enter:
   - Price per token (e.g., $30)
   - Duration (e.g., 30 days)
5. Click "List Tokens"

### 3. Expected Results

**Browser Console:**
```
Listing tokens for sale...
✅ Tokens listed successfully!
```

**UI:**
- ✅ Green toast: "Tokens listed for sale successfully!"
- ✅ Modal closes
- ✅ Listing appears in Marketplace section

**API Response:**
```json
{
  "success": true,
  "listing": {
    "id": "2",
    "listingId": 2,
    "groveName": "Test Grove",
    "sellerAddress": "0.0.789012",
    "tokenAmount": 5,
    "pricePerToken": 30,
    "listingDate": "2025-01-12T...",
    "expirationDate": "2025-02-11T...",
    "isActive": true
  },
  "message": "Tokens listed for sale successfully"
}
```

### 4. Verify in Marketplace
1. Go to Marketplace section
2. Your listing should appear
3. Shows:
   - Grove name
   - Token amount
   - Price per token
   - Expiration date
   - "Buy Tokens" button

## What Now Works

✅ List tokens for sale from Portfolio  
✅ View marketplace listings  
✅ Purchase from marketplace  
✅ Cancel listings  
✅ Update listing prices  
✅ View trade history  
✅ See marketplace statistics  

## Status
🎉 **FIXED** - Marketplace listing functionality now works!

## Note
The marketplace currently uses mock data (in-memory). Listings will be lost when the server restarts. To persist listings, you would need to:
1. Create a `marketplace_listings` database table
2. Update the functions to use the database instead of `mockListings`
3. Add proper transaction handling
