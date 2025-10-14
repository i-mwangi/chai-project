# Market Prices System - How It Works

## ✅ Your System is Already Set Up!

Your coffee platform **already has live price scraping** implemented and working. Here's how it works:

## 🔄 Automatic Price Updates

### Data Sources (in priority order):

1. **API Sources** (if API keys configured):
   - ICE (Intercontinental Exchange)
   - CME Group  
   - Coffee Exchange API

2. **Web Scraping** (automatic fallback):
   - ✅ Yahoo Finance → Arabica prices (ICE Coffee C Futures)
   - ✅ Investing.com → Robusta prices
   - ✅ Estimated → Specialty (+35% premium) & Organic (+25% premium)

3. **Fallback Prices** (if scraping fails):
   - Static prices to keep system running

### Update Frequency:
- **Every 30 minutes** - Automatic price refresh
- **Manual trigger** - Available via API endpoint

## 📊 What Gets Displayed

Your UI shows:
- **Current prices** by variety (Arabica, Robusta, Specialty, Organic)
- **Quality grade pricing** (grades 1-10)
- **Price ranges** from multiple sources
- **Seasonal multipliers** by month
- **Last update timestamp**

## 🚀 How to Use

### Option 1: Mock Server (Testing)
```bash
npm run dev
# or
npm run api:mock
```
- Uses **static prices** from `frontend/api-server.js`
- Good for UI testing without external dependencies
- Prices don't change

### Option 2: Real API Server (Production)
```bash
npm run dev:full
# or
npm run api
```
- Uses **live web scraping** from Yahoo Finance & Investing.com
- Prices update every 30 minutes automatically
- Real market data

## 📁 Key Files

### Backend (Live Scraping):
- `providers/coffee-price-scraper.ts` - Web scraping logic
- `providers/coffee-market-provider.ts` - Price management & updates
- `api/market-data.ts` - API endpoints

### Frontend (Display):
- `frontend/js/market-prices-display.js` - UI display logic
- `frontend/api-server.js` - Mock server for testing

## 🔌 API Endpoints

```
GET /api/market/prices
GET /api/market/price-history?variety=arabica&days=30
GET /api/market/conditions?variety=arabica
POST /api/market/trigger-update (manual refresh)
```

## 🎯 Current Implementation

The scraper fetches:

```javascript
// Arabica from Yahoo Finance
https://finance.yahoo.com/quote/KC=F
→ Converts cents/lb to $/kg

// Robusta from Investing.com  
https://www.investing.com/commodities/robusta-coffee-10
→ Converts $/ton to $/kg

// Specialty & Organic
→ Estimated from Arabica base price
```

## ⚙️ Configuration

No configuration needed! The system automatically:
1. Tries API sources (if keys exist in `.env`)
2. Falls back to web scraping (no keys needed)
3. Uses fallback prices if everything fails

### Optional: Add API Keys for Better Data

Create `.env` file:
```env
ICE_API_KEY=your_key_here
CME_API_KEY=your_key_here
COFFEE_EXCHANGE_API_KEY=your_key_here
```

## 🧪 Testing the Scraper

The scraper is already working! To verify:

1. Start the real API server:
```bash
npm run api
```

2. Check the console logs - you'll see:
```
Initializing coffee price history...
Market services initialized
Fetching latest coffee prices...
```

3. Visit the frontend and check Market Prices section

## 💡 No Manual Updates Needed!

The system handles everything automatically:
- ✅ Fetches prices every 30 minutes
- ✅ Stores price history
- ✅ Generates market alerts
- ✅ Validates reported prices
- ✅ Calculates trends and volatility

## 🎨 UI Features

Your Market Prices page shows:
- **Variety filter** (All, Arabica, Robusta, Specialty, Organic)
- **Current prices** with source attribution
- **Price ranges** (min/max from multiple sources)
- **Quality grade breakdown** (if available)
- **Refresh button** (manual update)
- **Last updated** timestamp
- **Auto-refresh** every 5 minutes

## 🔍 How to Check if It's Working

1. Open browser console
2. Navigate to Market Prices page
3. Look for:
```
Initializing Market Prices Display...
Auto-refresh enabled: every 5 minutes
```

4. Check network tab for:
```
GET /api/market/prices → 200 OK
```

## 📝 Summary

**You don't need to do anything!** The code you shared is already implemented in your system. Just run the real API server (`npm run api`) instead of the mock server, and you'll get live prices automatically.

The mock server is useful for frontend development without external dependencies, but when you're ready for real data, the scraper is already there waiting for you.
