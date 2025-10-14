# Browse Groves Display Fix

## Issues Fixed

### 1. ❌ Health Score Showing "undefined" → ✅ Fixed
**Problem**: In the "Available Coffee Groves" section (Browse tab), health scores were showing as "undefined"

**Root Cause**: 
- Database stores health score as `currentHealthScore`
- API endpoint `/api/investment/available-groves` was returning all grove fields but not mapping `currentHealthScore` to `healthScore`
- Frontend expected `grove.healthScore` but received `grove.currentHealthScore`

**Fix Applied**:
- **Backend** (`api/server.ts`): Added mapping to include `healthScore: grove.currentHealthScore || 0`
- **Frontend** (`frontend/js/investor-portal.js`): Added fallback logic to check both `healthScore` and `currentHealthScore`

### 2. ❌ Location Filter Not Working → ✅ Fixed
**Problem**: The location dropdown filter (blue scrollable bar) wasn't filtering groves when changed

**Root Cause**:
- Event listeners were attached in the constructor before DOM was fully loaded
- When `populateLocationFilter()` rebuilt the dropdown HTML, it removed the event listener

**Fix Applied**:
- Re-attach event listener after populating location filter options
- Store handler reference to properly remove old listener before adding new one

---

## Changes Made

### File 1: `api/server.ts` (Line ~398)

**Before:**
```typescript
const availableGroves = groves.map(grove => {
    const treeCount = Number((grove as any).treeCount || 0)
    return {
        ...grove,
        tokensAvailable: Math.floor(treeCount * 0.5),
        pricePerToken: 25 + Math.floor(Math.random() * 100) / 10,
        projectedAnnualReturn: 10 + Math.floor(Math.random() * 80) / 10
    }
})
```

**After:**
```typescript
const availableGroves = groves.map(grove => {
    const treeCount = Number((grove as any).treeCount || 0)
    return {
        ...grove,
        healthScore: grove.currentHealthScore || 0,  // ✅ Added this line
        tokensAvailable: Math.floor(treeCount * 0.5),
        pricePerToken: 25 + Math.floor(Math.random() * 100) / 10,
        projectedAnnualReturn: 10 + Math.floor(Math.random() * 80) / 10
    }
})
```

### File 2: `frontend/js/investor-portal.js`

#### Change 1: Added fallback for health score in render (Line ~211)

**Before:**
```javascript
container.innerHTML = groves.map(grove => `
    <div class="marketplace-card">
        <div class="grove-header">
            <h4>${grove.groveName}</h4>
            <div class="health-indicator">
                <span class="health-score ${this.getHealthClass(grove.healthScore)}">
                    ${grove.healthScore}
                </span>
```

**After:**
```javascript
container.innerHTML = groves.map(grove => {
    const healthScore = grove.healthScore || grove.currentHealthScore || 0;  // ✅ Added fallback
    return `
    <div class="marketplace-card">
        <div class="grove-header">
            <h4>${grove.groveName}</h4>
            <div class="health-indicator">
                <span class="health-score ${this.getHealthClass(healthScore)}">
                    ${healthScore}
                </span>
```

#### Change 2: Re-attach location filter event listener (Line ~205)

**Before:**
```javascript
populateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');
    if (!locationFilter) return;

    const locations = [...new Set(this.availableGroves.map(grove => grove.location))];
    locationFilter.innerHTML = '<option value="">All Locations</option>';

    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}
```

**After:**
```javascript
populateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');
    if (!locationFilter) return;

    const locations = [...new Set(this.availableGroves.map(grove => grove.location))];
    locationFilter.innerHTML = '<option value="">All Locations</option>';

    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
    
    // ✅ Re-attach event listener to ensure it works
    locationFilter.removeEventListener('change', this.applyFiltersHandler);
    this.applyFiltersHandler = () => this.applyFilters();
    locationFilter.addEventListener('change', this.applyFiltersHandler);
}
```

---

## Testing

### To Test Health Score Fix:
1. Restart the backend: `npm run api`
2. Navigate to Investor Portal → Browse Groves
3. ✅ Health scores should now show numbers (0-100) instead of "undefined"
4. ✅ Color coding should work: Green (≥80), Yellow (60-79), Red (<60)

### To Test Location Filter Fix:
1. Navigate to Investor Portal → Browse Groves
2. Click the "All Locations" dropdown
3. Select a specific location (e.g., "Test Location", "Simulation muranga")
4. ✅ Only groves from that location should display
5. Select "All Locations" again
6. ✅ All groves should display again

---

## Related Issues

This fix is related to but separate from the **Portfolio Holdings** fix documented in `INVESTOR-PORTFOLIO-FIX-SUMMARY.md`:

| Section | Issue | Status |
|---------|-------|--------|
| **Browse Groves** | Health score undefined | ✅ Fixed (this document) |
| **Browse Groves** | Location filter not working | ✅ Fixed (this document) |
| **Portfolio Holdings** | Health score undefined | ✅ Fixed (previous) |
| **Portfolio Holdings** | Location tag not showing | ✅ Fixed (previous) |

---

## Restart Instructions

To apply these fixes:

```bash
# Stop the backend (Ctrl+C in the terminal running it)
# Then restart:
npm run api

# Frontend doesn't need restart for this fix
# But if you want to restart everything:
restart-all-servers.bat
```

Then refresh your browser at http://localhost:3000

---

## Data Flow

```
Database (coffee_groves table)
  ↓ currentHealthScore field
API Endpoint (/api/investment/available-groves)
  ↓ Maps to healthScore field
Frontend (investor-portal.js)
  ↓ Displays with fallback logic
User Interface
  ✅ Health score visible with correct value
  ✅ Location filter working properly
```
