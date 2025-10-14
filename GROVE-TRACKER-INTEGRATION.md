# Grove Tracker Integration Guide

## Overview
The Grove Tracker is a new feature that allows investors to track their coffee groves using satellite imagery and environmental data across Kenya, Uganda, and Ethiopia.

## Files Created
1. `frontend/grove-tracker.html` - Main tracker page
2. `frontend/js/grove-tracker.js` - JavaScript functionality

## Features
- **Interactive Map**: Powered by Mapbox with satellite imagery
- **87 Coffee Groves**: Across Kenya (44), Uganda (21), and Ethiopia (22)
- **Country Filtering**: Filter groves by country
- **Search Functionality**: Search groves by name, description, or country
- **Layer Toggle**: Switch between satellite and terrain views
- **Responsive Design**: Works on desktop and mobile
- **Real-time Selection**: Click on markers or list items to view grove details

## Integration Steps

### Option 1: Add to Navigation (Recommended)
Add a link in the main navigation bar in `frontend/index.html`:

```html
<div class="nav-section">
    <a href="grove-tracker.html" class="faq-link">🌍 Grove Tracker</a>
    <a href="#faq" class="faq-link">FAQs</a>
    <button class="signup-btn">Sign Up</button>
</div>
```

### Option 2: Add to Platform Technology Section
Add a new feature card in the Platform Technology section (around line 1168):

```html
<div class="feature-card" style="cursor: pointer;" onclick="window.location.href='grove-tracker.html'">
    <img src="public/satellite.png" alt="Satellite imagery and grove tracking" 
         style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px;" 
         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%232a1d17%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2260%22 fill=%22%23D4A373%22%3E🛰️%3C/text%3E%3C/svg%3E'">
    <h3>🌍 Grove Tracker</h3>
    <p>Track your coffee groves with satellite imagery and environmental data across Kenya, Uganda, and Ethiopia</p>
    <div style="margin-top: 15px; padding: 10px; background: rgba(212, 163, 115, 0.1); border-radius: 6px; text-align: center;">
        <span style="color: #D4A373; font-weight: 600;">Click to Explore →</span>
    </div>
</div>
```

### Option 3: Add to Investor Portal
Add a button in the investor dashboard (`frontend/js/investor-portal.js`):

```javascript
// Add this button to the investor dashboard
<button class="btn-primary" onclick="window.location.href='grove-tracker.html'">
    🌍 Track My Groves
</button>
```

## Mapbox Configuration
The tracker uses your provided Mapbox credentials:
- **Access Token**: `pk.eyJ1IjoiaGVucnlidXRub3RkYW5nZXIiLCJhIjoiY21ncHVmeGx1MjJvdzJrcXc4cXE2YTZpdyJ9.dwV49MrvgHcN9KGbFShVeg`
- **Style**: `mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t`

## Design Consistency
The Grove Tracker matches your platform's aesthetic:
- **Color Scheme**: Uses your existing CSS variables (--bg-dark, --accent-primary, etc.)
- **Typography**: Comic Neue and Inter fonts
- **Glassmorphism**: Consistent with your platform's design language
- **Country Colors**:
  - Kenya: Red (#ef4444)
  - Uganda: Blue (#3b82f6)
  - Ethiopia: Green (#10b981)

## Usage
1. Navigate to `grove-tracker.html` in your browser
2. Use the search bar to find specific groves
3. Filter by country using the filter buttons
4. Click on any grove in the list or map marker to view details
5. Toggle between satellite and terrain views
6. Collapse/expand the sidebar for better map viewing

## Future Enhancements
- Real-time environmental data integration
- Historical satellite imagery comparison
- Grove health metrics and analytics
- Weather data overlay
- Harvest predictions
- Integration with blockchain data for ownership verification

## Testing
Access the tracker directly at: `http://localhost:3000/grove-tracker.html` (or your server URL)

## Support
The tracker is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets
- Mobile devices
