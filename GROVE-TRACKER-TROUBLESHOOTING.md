# Grove Tracker - Troubleshooting Guide

## Issue: Map Not Visible

### Quick Diagnosis

Run this command to test:
```bash
debug-grove-tracker.bat
```

This will open two windows:
1. **Simple test** - Verifies Mapbox credentials work
2. **Full tracker** - Shows debug console logs

### Step-by-Step Debugging

#### Step 1: Test Mapbox Credentials

Open: `http://localhost:3000/test-mapbox-simple.html`

**Expected Result:**
- Green text: "✓ Map loaded successfully!"
- Map visible with satellite imagery
- Red marker on Nairobi

**If this fails:**
- ❌ Check internet connection
- ❌ Verify Mapbox token is valid
- ❌ Check browser console for errors

#### Step 2: Check Browser Console

1. Open `grove-tracker.html`
2. Press **F12** to open Developer Tools
3. Click **Console** tab

**Expected Console Messages:**
```
DOM loaded, initializing Grove Tracker...
Mapbox GL JS loaded: true
Access token: Set
Initializing map...
Map instance created
Map loaded successfully!
Markers added
```

**If you see errors:**

##### Error: "401 Unauthorized"
```
Problem: Invalid Mapbox access token
Solution: Verify token in grove-tracker.js line 3
```

##### Error: "404 Not Found" or "Style not found"
```
Problem: Invalid style URL
Solution: Verify style URL in grove-tracker.js
Current: mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t
```

##### Error: "mapboxgl is not defined"
```
Problem: Mapbox GL JS library not loaded
Solution: Check internet connection or CDN
```

##### Error: "Container 'map' not found"
```
Problem: HTML element with id="map" missing
Solution: Check grove-tracker.html has <div id="map"></div>
```

#### Step 3: Check Element Height

In Developer Tools:
1. Click **Elements** tab
2. Find `<div id="map"></div>`
3. Look at **Computed** styles on the right
4. Check **height** value

**Expected:**
- Height should be > 0px (e.g., 937px)

**If height is 0px:**
- Problem: CSS not applied correctly
- Solution: Check that all parent elements have height

#### Step 4: Check Network Requests

In Developer Tools:
1. Click **Network** tab
2. Refresh the page
3. Look for failed requests (red)

**Check these URLs:**
- `https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js` ✓
- `https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css` ✓
- `https://api.mapbox.com/styles/v1/...` ✓

### Common Solutions

#### Solution 1: Clear Browser Cache
```
1. Press Ctrl+Shift+Delete
2. Clear cached images and files
3. Refresh page (Ctrl+F5)
```

#### Solution 2: Try Different Browser
```
Test in:
- Chrome
- Firefox
- Edge
```

#### Solution 3: Check Server is Running
```
Make sure your frontend server is running on port 3000
```

#### Solution 4: Verify File Paths
```
Check these files exist:
- frontend/grove-tracker.html ✓
- frontend/js/grove-tracker.js ✓
```

### Manual Token/Style Update

If you need to update the credentials manually:

**File:** `frontend/js/grove-tracker.js`

**Line 3:** Update access token
```javascript
mapboxgl.accessToken = 'YOUR_TOKEN_HERE';
```

**Line 120:** Update style URL
```javascript
map = new mapboxgl.Map({
    container: 'map',
    style: 'YOUR_STYLE_URL_HERE',
    center: [36, 2],
    zoom: 5,
    projection: 'globe'
});
```

### Your Credentials

**Access Token:**
```
pk.eyJ1IjoiaGVucnlidXRub3RkYW5nZXIiLCJhIjoiY21ncHVmeGx1MjJvdzJrcXc4cXE2YTZpdyJ9.dwV49MrvgHcN9KGbFShVeg
```

**Style URL:**
```
mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t
```

### Test Checklist

- [ ] Internet connection working
- [ ] Server running on localhost:3000
- [ ] test-mapbox-simple.html shows map
- [ ] Browser console shows no errors
- [ ] #map element has height > 0
- [ ] Network requests successful
- [ ] Mapbox GL JS library loaded

### Still Not Working?

#### Option 1: Use Alternative Style

Try using a default Mapbox style:

```javascript
style: 'mapbox://styles/mapbox/satellite-v9'
```

#### Option 2: Simplify the Map

Remove the globe projection temporarily:

```javascript
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t',
    center: [36, 2],
    zoom: 5
    // Remove: projection: 'globe'
});
```

#### Option 3: Check Mapbox Account

1. Go to https://account.mapbox.com/
2. Verify your account is active
3. Check token permissions
4. Verify style exists

### Debug Output Example

**Working Console:**
```
DOM loaded, initializing Grove Tracker...
Mapbox GL JS loaded: true
Access token: Set
Initializing map...
Map instance created
Map loaded successfully!
Markers added
```

**Broken Console (Example):**
```
DOM loaded, initializing Grove Tracker...
Mapbox GL JS loaded: true
Access token: Set
Initializing map...
Map error: {status: 401, message: "Unauthorized"}
```

### Contact Information

If you've tried everything and it still doesn't work:

1. Check browser console screenshot
2. Check network tab screenshot
3. Verify all files are in correct locations
4. Try the simple test first

### Quick Fixes Summary

| Problem | Solution |
|---------|----------|
| Map not visible | Check #map height in Elements tab |
| 401 Error | Verify access token |
| 404 Error | Verify style URL |
| No console logs | Check JS file is loaded |
| Blank screen | Check browser console for errors |
| Works in test, not in tracker | CSS/layout issue |

### Next Steps

1. Run `debug-grove-tracker.bat`
2. Check both test windows
3. Open browser console (F12)
4. Look for error messages
5. Follow solutions above

The map should work! Let's debug it together. 🔍
