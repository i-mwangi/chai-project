# Investor Dashboard - Browse Groves Filters Guide

## Filter Controls Overview

The "Available Coffee Groves" section has **3 filter controls** to help investors find groves that match their investment criteria:

---

## 1. 🌱 Coffee Variety Filter (Dropdown)

**Purpose**: Filter groves by coffee variety/type

**Options**:
- All Varieties (shows all)
- Arabica
- Robusta
- Bourbon
- Typica
- Caturra
- Geisha

**Use Case**: 
- If you prefer investing in premium Geisha coffee
- If you want only Arabica groves (most popular)
- If you're interested in specific varieties

**Example**: Select "Geisha" to see only Geisha coffee groves

---

## 2. 📍 Location Filter (Dropdown)

**Purpose**: Filter groves by geographic location

**Options**:
- All Locations (shows all)
- Dynamically populated based on available groves
  - Test Location
  - Simulation
  - muranga
  - (etc.)

**Use Case**:
- Invest in specific regions you trust
- Diversify across different locations
- Focus on areas with better climate/conditions

**Example**: Select "muranga" to see only groves in that region

---

## 3. 📊 Yield Filter (Blue Slider) ⬅️ **This is what you're asking about!**

**Purpose**: Filter groves by minimum expected yield per tree

**Type**: Range slider (0 to 10 kg/tree)

**How it works**:
- Drag the slider to the right to increase minimum yield
- Only groves with yield **≥** your selected value will show
- Default: 0 (shows all groves)

**Use Case**:
- Find high-productivity groves
- Filter out low-yield investments
- Focus on groves with better returns

**Example**: 
- Set slider to **5 kg/tree** → Only shows groves producing ≥5 kg per tree
- Set slider to **8 kg/tree** → Only shows high-yield groves

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ Available Coffee Groves                                 │
├─────────────────────────────────────────────────────────┤
│ [All Varieties ▼] [All Locations ▼] [━━━━━●────────]   │
│   Coffee Variety    Location Filter   Yield Filter      │
│                                        (0-10 kg/tree)    │
└─────────────────────────────────────────────────────────┘
```

---

## How Filters Work Together

All three filters work **simultaneously** (AND logic):

**Example Scenario**:
- Variety: **Arabica**
- Location: **muranga**
- Yield: **≥ 6 kg/tree**

**Result**: Shows only Arabica groves in muranga that produce at least 6 kg per tree

---

## Why Use the Yield Filter?

### Investment Strategy Benefits:

1. **Higher Returns**: Higher yield = more coffee = more revenue
2. **Risk Assessment**: Low yield might indicate poor conditions
3. **Productivity Focus**: Find the most productive groves
4. **ROI Optimization**: Better yield often means better returns

### Typical Yield Ranges:

| Yield (kg/tree/year) | Quality | Investment Grade |
|---------------------|---------|------------------|
| 0-3 | Low | ⚠️ Risky |
| 3-5 | Average | 🟡 Moderate |
| 5-7 | Good | 🟢 Good |
| 7-10 | Excellent | 💎 Premium |

---

## How to Use the Yield Filter

### Step-by-Step:

1. **Navigate** to Investor Portal → Browse Groves
2. **Locate** the blue slider (rightmost filter)
3. **Click and drag** the circular handle to the right
4. **Watch** as groves filter in real-time
5. **Release** when you find your desired minimum yield

### Tips:

- **Start low** (0-3) to see all options
- **Increase gradually** to narrow down choices
- **Combine** with variety and location for best results
- **Reset** by dragging back to 0 to see all groves again

---

## Technical Details

### Filter Implementation:

```javascript
// From investor-portal.js
applyFilters() {
    const varietyFilter = document.getElementById('varietyFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const yieldFilter = parseFloat(document.getElementById('yieldFilter')?.value || 0);

    let filteredGroves = this.availableGroves.filter(grove => {
        const varietyMatch = !varietyFilter || grove.coffeeVariety === varietyFilter;
        const locationMatch = !locationFilter || grove.location === locationFilter;
        const yieldMatch = !yieldFilter || grove.expectedYieldPerTree >= yieldFilter;

        return varietyMatch && locationMatch && yieldMatch;
    });

    this.renderAvailableGroves(filteredGroves);
}
```

### Data Source:

The `expectedYieldPerTree` value comes from:
- Farmer registration (when they register the grove)
- Historical harvest data
- Stored in `coffee_groves` table

---

## Example Use Cases

### Conservative Investor:
```
Variety: Arabica (stable market)
Location: Any
Yield: ≥ 5 kg/tree (proven productivity)
```

### Premium Investor:
```
Variety: Geisha (premium coffee)
Location: Specific region
Yield: ≥ 7 kg/tree (high productivity)
```

### Diversified Investor:
```
Variety: All Varieties
Location: Multiple (invest in different groves)
Yield: ≥ 4 kg/tree (minimum acceptable)
```

---

## Troubleshooting

### Filter Not Working?
1. ✅ Check that groves are loaded (not empty state)
2. ✅ Try resetting all filters to default
3. ✅ Refresh the page
4. ✅ Check browser console for errors

### No Groves Showing?
- Your filters might be too restrictive
- Try lowering the yield slider
- Select "All Varieties" and "All Locations"
- Check if any groves exist in the database

---

## Related Features

- **Health Score**: Shows grove health (0-100)
- **Price per Token**: Investment cost
- **Projected Annual Return**: Expected ROI %
- **Tokens Available**: How many tokens you can buy

---

## Summary

The **blue slider** (Yield Filter) helps you:
- ✅ Find high-productivity groves
- ✅ Filter by minimum expected yield (kg/tree/year)
- ✅ Make data-driven investment decisions
- ✅ Optimize your portfolio for better returns

**Range**: 0 to 10 kg per tree per year  
**Purpose**: Show only groves meeting your minimum yield requirement  
**Benefit**: Invest in more productive, profitable groves
