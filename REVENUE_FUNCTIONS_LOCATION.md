# Revenue Functions Location Guide

## 📍 Where Total Revenue Functions Are Located

### 1. **Main Dashboard Revenue Display**

**File**: `frontend/js/main.js`  
**Function**: `updateDashboardStats()`  
**Lines**: ~187-238

```javascript
updateDashboardStats(marketOverview, pricesResponse) {
    console.log('Updating dashboard stats...');
    
    // Total Revenue Calculation
    const totalRevenueVal = marketOverview && marketOverview.success
        ? Number(marketOverview.totalRevenue ?? marketOverview.data?.totalRevenue ?? 0)
        : 125000; // Default/mock value
    
    const stats = {
        totalGroves: totalGrovesVal,
        activeFarmers: activeFarmersVal,
        totalRevenue: totalRevenueVal,  // ← Total Revenue
        coffeePrice: coffeePriceVal
    };
    
    // Update DOM element
    const totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl) {
        totalRevenueEl.textContent = `${stats.totalRevenue.toLocaleString()}`;
    }
}
```

**What it does**:
- Gets total revenue from API (`marketOverview.totalRevenue`)
- Falls back to mock value (125000) if API fails
- Displays it in the dashboard with proper formatting

---

### 2. **HTML Element for Total Revenue**

**File**: `frontend/app.html`  
**Element ID**: `totalRevenue`  
**Location**: Dashboard stats grid

```html
<div class="stat-card card-stat">
    <div class="stat-icon">
        <svg><!-- Dollar icon --></svg>
    </div>
    <div class="stat-content">
        <h3>Total Revenue</h3>
        <div class="stat-value" id="totalRevenue">-</div>
    </div>
</div>
```

---

### 3. **API Endpoint for Total Revenue**

**File**: `frontend/js/api.js` (or `api/server.ts`)  
**Endpoint**: `/api/market/overview`  
**Method**: `getMarketOverview()`

```javascript
// In frontend/js/api.js
async getMarketOverview() {
    try {
        const response = await fetch(`${this.baseURL}/market/overview`);
        const data = await response.json();
        return {
            success: true,
            totalGroves: data.totalGroves,
            activeFarmers: data.activeFarmers,
            totalRevenue: data.totalRevenue,  // ← API returns this
            // ... other data
        };
    } catch (error) {
        return { success: false };
    }
}
```

---

### 4. **Farmer Revenue Tracking**

**File**: `frontend/js/farmer-dashboard.js`  
**Section**: Revenue Tracking Section  
**Functions**: `loadRevenue()`, `renderRevenue()`

```javascript
async loadRevenue(farmerAddress) {
    // Load farmer-specific revenue data
    const response = await window.coffeeAPI.getFarmerRevenue(farmerAddress);
    
    if (response.success) {
        this.renderRevenue(response.revenue);
    }
}

renderRevenue(revenueData) {
    // Update farmer revenue displays
    document.getElementById('totalEarnings').textContent = 
        `$${revenueData.totalEarnings.toLocaleString()}`;
    document.getElementById('monthlyEarnings').textContent = 
        `$${revenueData.monthlyEarnings.toLocaleString()}`;
    document.getElementById('pendingDistributions').textContent = 
        `$${revenueData.pending.toLocaleString()}`;
}
```

---

### 5. **Investor Earnings Display**

**File**: `frontend/js/investor-portal.js`  
**Section**: Earnings Section  
**Functions**: `loadEarnings()`, `renderEarnings()`

```javascript
async loadEarnings(investorAddress) {
    // Load investor earnings data
    const response = await window.coffeeAPI.getInvestorEarnings(investorAddress);
    
    if (response.success) {
        this.renderEarnings(response.earnings);
    }
}

renderEarnings(earningsData) {
    // Update investor earnings displays
    document.getElementById('totalEarningsValue').textContent = 
        `$${earningsData.total.toLocaleString()}`;
    document.getElementById('pendingEarningsValue').textContent = 
        `$${earningsData.pending.toLocaleString()}`;
}
```

---

## 🔍 How to Find Revenue Functions

### Method 1: Search by Function Name
```bash
# Search for revenue functions
grep -r "loadRevenue\|updateRevenue\|totalRevenue" frontend/js/
```

### Method 2: Search by Element ID
```bash
# Find where totalRevenue element is updated
grep -r "getElementById('totalRevenue')" frontend/js/
```

### Method 3: Search by Section
```bash
# Find revenue section code
grep -r "revenueSection\|Revenue Tracking" frontend/
```

---

## 📊 Revenue Data Flow

```
1. API Call
   ↓
   window.coffeeAPI.getMarketOverview()
   
2. Backend Response
   ↓
   { totalRevenue: 125000, ... }
   
3. Main.js Processing
   ↓
   updateDashboardStats(marketOverview)
   
4. DOM Update
   ↓
   document.getElementById('totalRevenue').textContent = "125,000"
   
5. Display
   ↓
   User sees: "Total Revenue: 125,000"
```

---

## 🛠️ How to Modify Total Revenue

### Change Default/Mock Value

**File**: `frontend/js/main.js`  
**Line**: ~203

```javascript
// Change from:
const totalRevenueVal = marketOverview && marketOverview.success
    ? Number(marketOverview.totalRevenue ?? marketOverview.data?.totalRevenue ?? 0)
    : 125000; // ← Change this default value

// To:
const totalRevenueVal = marketOverview && marketOverview.success
    ? Number(marketOverview.totalRevenue ?? marketOverview.data?.totalRevenue ?? 0)
    : 250000; // New default value
```

### Add Currency Symbol

**File**: `frontend/js/main.js`  
**Line**: ~234

```javascript
// Change from:
if (totalRevenueEl) totalRevenueEl.textContent = `${stats.totalRevenue.toLocaleString()}`;

// To:
if (totalRevenueEl) totalRevenueEl.textContent = `$${stats.totalRevenue.toLocaleString()}`;
```

### Format with Decimals

```javascript
// Show with 2 decimal places
if (totalRevenueEl) {
    totalRevenueEl.textContent = `$${stats.totalRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
```

---

## 🐛 Troubleshooting Revenue Display

### Issue: Revenue Shows "-" or "0"

**Check**:
1. API is returning data
2. Element ID matches: `id="totalRevenue"`
3. Function is being called: `updateDashboardStats()`

**Debug**:
```javascript
// Add console logs in main.js
updateDashboardStats(marketOverview, pricesResponse) {
    console.log('Market Overview:', marketOverview);
    console.log('Total Revenue:', totalRevenueVal);
    
    // ... rest of function
}
```

### Issue: Revenue Not Updating

**Check**:
1. `loadDashboardData()` is called when view switches
2. API endpoint is working
3. No JavaScript errors in console

**Fix**:
```javascript
// Force refresh
window.viewManager.loadDashboardData();
```

---

## 📝 Quick Reference

| What | Where | Line |
|------|-------|------|
| Display Function | `frontend/js/main.js` | ~187-238 |
| HTML Element | `frontend/app.html` | Search for `id="totalRevenue"` |
| API Call | `frontend/js/api.js` | `getMarketOverview()` |
| Default Value | `frontend/js/main.js` | ~203 |
| DOM Update | `frontend/js/main.js` | ~234 |

---

## 🎯 Common Tasks

### Task 1: Change Revenue Display Format
**File**: `frontend/js/main.js`, Line ~234

### Task 2: Add Revenue Calculation
**File**: `api/server.ts` or backend revenue calculation

### Task 3: Show Revenue Breakdown
**File**: `frontend/js/dashboard-enhanced.js`, add new function

### Task 4: Export Revenue Data
**File**: Create new function in `frontend/js/api.js`

---

Need help with a specific revenue function? Let me know!
