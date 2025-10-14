# Grove Tracker - Debug Steps

## Quick Test (2 minutes)

### Step 1: Run Debug Script
```bash
debug-grove-tracker.bat
```

This opens two windows to test:
1. **Simple Mapbox Test** - Verifies credentials
2. **Full Grove Tracker** - With debug logging

### Step 2: Check Simple Test

**Window 1: test-mapbox-simple.html**

✅ **Success looks like:**
- Green text: "✓ Map loaded successfully!"
- Satellite map visible
- Red marker on Nairobi, Kenya

❌ **Failure looks like:**
- Red error message
- Blank screen
- No map visible

### Step 3: Check Grove Tracker

**Window 2: grove-tracker.html**

1. Press **F12** (Developer Tools)
2. Click **Console** tab
3. Look for messages

✅ **Success console:**
```
DOM loaded, initializing Grove Tracker...
Mapbox GL JS loaded: true
Access token: Set
Map instance created
Map loaded successfully!
Markers added
```

❌ **Failure console:**
- Red error messages
- "401 Unauthorized"
- "404 Not Found"
- "mapboxgl is not defined"

## What Each Error Means

### Error: "401 Unauthorized"
**Problem:** Mapbox token is invalid or expired

**Fix:**
1. Open `frontend/js/grove-tracker.js`
2. Line 3: Update token
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoiaGVucnlidXRub3RkYW5nZXIiLCJhIjoiY21ncHVmeGx1MjJvdzJrcXc4cXE2YTZpdyJ9.dwV49MrvgHcN9KGbFShVeg';
```

### Error: "404 Not Found" or "Style not found"
**Problem:** Style URL is incorrect

**Fix:**
1. Open `frontend/js/grove-tracker.js`
2. Around line 120: Update style
```javascript
style: 'mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t'
```

### Error: "mapboxgl is not defined"
**Problem:** Mapbox library didn't load

**Fix:**
1. Check internet connection
2. Try refreshing page (Ctrl+F5)
3. Check browser console Network tab

### Error: Map loads but not visible
**Problem:** CSS height issue

**Fix:**
1. Press F12
2. Click Elements tab
3. Find `<div id="map"></div>`
4. Check Computed height (should be > 0px)

## Visual Debugging

### What You Should See

```
┌──────────────┬────────────────────────────────┐
│              │                                │
│   SIDEBAR    │      SATELLITE MAP             │
│              │                                │
│  🔍 Search   │   🗺️ (Should see Earth)       │
│              │                                │
│  Filters     │   🔴 🔵 🟢 (Colored dots)     │
│  [Kenya]     │                                │
│  [Uganda]    │   (Map with terrain/water)    │
│  [Ethiopia]  │                                │
│              │                                │
│  Grove List  │                                │
│  • Bensa     │                                │
│  • Dale      │                                │
│  ...         │                                │
└──────────────┴────────────────────────────────┘
```

### What You Might See (Problems)

#### Problem 1: Blank Right Side
```
┌──────────────┬────────────────────────────────┐
│              │                                │
│   SIDEBAR    │      [BLANK/DARK]              │
│              │                                │
│  (Visible)   │   (Nothing here)               │
└──────────────┴────────────────────────────────┘
```
**Cause:** Map not loading
**Check:** Browser console for errors

#### Problem 2: No Sidebar
```
┌────────────────────────────────────────────────┐
│                                                │
│              [BLANK/DARK]                      │
│                                                │
│          (Nothing visible)                     │
└────────────────────────────────────────────────┘
```
**Cause:** CSS not loading or JS error
**Check:** Browser console and Network tab

#### Problem 3: Gray Tiles
```
┌──────────────┬────────────────────────────────┐
│              │                                │
│   SIDEBAR    │   ▢ ▢ ▢ ▢ ▢                   │
│              │   ▢ ▢ ▢ ▢ ▢                   │
│  (Visible)   │   ▢ ▢ ▢ ▢ ▢                   │
│              │   (Gray squares)               │
└──────────────┴────────────────────────────────┘
```
**Cause:** Map tiles not loading (network/token issue)
**Check:** Network tab for 401/403 errors

## Quick Fixes

### Fix 1: Hard Refresh
```
Press: Ctrl + Shift + R (Windows)
Or: Cmd + Shift + R (Mac)
```

### Fix 2: Clear Cache
```
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page
```

### Fix 3: Try Different Browser
```
Test in order:
1. Chrome
2. Firefox  
3. Edge
```

### Fix 4: Check Server
```
Make sure server is running:
http://localhost:3000
```

## Verification Checklist

Before debugging, verify:

- [ ] Server is running on localhost:3000
- [ ] Internet connection is working
- [ ] Browser is up to date
- [ ] Files exist:
  - [ ] frontend/grove-tracker.html
  - [ ] frontend/js/grove-tracker.js
  - [ ] frontend/test-mapbox-simple.html

## Test Results

### ✅ If Simple Test Works
**Meaning:** Mapbox credentials are correct

**Next:** Check grove-tracker.html console for errors

### ❌ If Simple Test Fails
**Meaning:** Mapbox credentials or connection issue

**Next:** 
1. Check internet connection
2. Verify token at https://account.mapbox.com/
3. Try default style: `mapbox://styles/mapbox/satellite-v9`

### ✅ If Both Work
**Meaning:** Everything is working!

**Enjoy:** Your Grove Tracker is ready! 🎉

### ❌ If Simple Works, Tracker Doesn't
**Meaning:** CSS or JavaScript issue in tracker

**Next:**
1. Check browser console
2. Check #map element height
3. Look for JavaScript errors

## Advanced Debugging

### Check Element Height
```javascript
// Paste in browser console:
const mapEl = document.getElementById('map');
console.log('Map element:', mapEl);
console.log('Height:', mapEl.offsetHeight);
console.log('Width:', mapEl.offsetWidth);
```

**Expected:**
```
Map element: <div id="map">...</div>
Height: 937
Width: 1520
```

### Check Mapbox Loaded
```javascript
// Paste in browser console:
console.log('Mapbox loaded:', typeof mapboxgl !== 'undefined');
console.log('Token set:', mapboxgl.accessToken ? 'Yes' : 'No');
```

**Expected:**
```
Mapbox loaded: true
Token set: Yes
```

### Force Map Resize
```javascript
// Paste in browser console (after map loads):
if (window.map) {
    map.resize();
    console.log('Map resized');
}
```

## Still Not Working?

### Option 1: Use Fallback Style
Edit `frontend/js/grove-tracker.js` line ~120:
```javascript
style: 'mapbox://styles/mapbox/satellite-streets-v12'
```

### Option 2: Remove Globe Projection
Edit `frontend/js/grove-tracker.js` line ~120:
```javascript
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t',
    center: [36, 2],
    zoom: 5
    // Remove this line: projection: 'globe'
});
```

### Option 3: Increase Timeout
Sometimes the map needs more time to load. Wait 5-10 seconds after page loads.

## Success Indicators

You'll know it's working when you see:

1. ✅ Sidebar with search box and filters
2. ✅ List of 87 groves
3. ✅ Satellite map on the right
4. ✅ Colored markers (red, blue, green)
5. ✅ Map responds to clicks
6. ✅ No errors in console

## Get Help

If still stuck, check:
1. `GROVE-TRACKER-TROUBLESHOOTING.md` - Detailed guide
2. Browser console screenshot
3. Network tab for failed requests
4. Verify all credentials are correct

**Your Credentials:**
- Token: `pk.eyJ1IjoiaGVucnlidXRub3RkYW5nZXIiLCJhIjoiY21ncHVmeGx1MjJvdzJrcXc4cXE2YTZpdyJ9.dwV49MrvgHcN9KGbFShVeg`
- Style: `mapbox://styles/henrybutnotdanger/cmgqmt1ga001c01sbcdaven4t`

Good luck! The map should work. 🗺️
