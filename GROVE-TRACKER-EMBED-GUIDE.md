# Grove Tracker - Embed in Index.html Guide

## Quick Start (Automatic)

### Option 1: Run the Batch File (Easiest)
```bash
insert-grove-tracker.bat
```

This will:
1. ✅ Create a backup of your index.html
2. ✅ Insert the Grove Tracker section automatically
3. ✅ Place it between "Our Solution" and "Platform Technology"
4. ✅ Add even margins on both sides

### Option 2: Run PowerShell Script
```powershell
powershell -ExecutionPolicy Bypass -File insert-grove-tracker.ps1
```

## What Gets Inserted

The Grove Tracker section includes:

### 1. Section Header
- Title: "🌍 Track Your Groves from Space"
- Description text
- Centered layout

### 2. Embedded Map (600px height)
- Full-width iframe with even margins
- Max-width: 1200px (centered)
- Rounded corners with shadow
- Loads grove-tracker.html

### 3. Call-to-Action Button
- "🚀 Open Full Screen Tracker →"
- Opens grove-tracker.html in new tab
- Hover effects

### 4. Feature Highlights
- 🛰️ Satellite Imagery
- 🌍 3D Globe View
- 📍 87 Groves

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🌍 Track Your Groves from Space            │
│                                                         │
│     Monitor your coffee grove investments with...       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │         [Embedded Grove Tracker Map]            │  │
│  │         (600px height, centered)                │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│           [🚀 Open Full Screen Tracker →]              │
│                                                         │
│    🛰️              🌍              📍                  │
│  Satellite      3D Globe         87 Groves            │
│   Imagery         View                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Margins & Spacing

### Outer Container
- Max-width: 1400px
- Padding: 80px 20px
- Centered with `margin: 0 auto`

### Map Container
- Max-width: 1200px
- Padding: 0 20px (even margins)
- Centered with `margin: 0 auto`

### Result
- Even margins on left and right
- Responsive on all screen sizes
- Looks great on desktop and mobile

## Manual Installation (If Needed)

If you prefer to insert manually:

1. Open `frontend/index.html`
2. Find this line:
   ```html
   <!-- PLATFORM TECHNOLOGY -->
   ```
3. Insert the content from `grove-tracker-embed-section.html` BEFORE that line
4. Save the file

## Location in index.html

The Grove Tracker will be inserted:

```
... (other content)

</section>  ← End of "Our Solution" section

<!-- GROVE TRACKER SECTION -->  ← NEW SECTION INSERTED HERE
<section style="padding: 80px 20px...">
    ... Grove Tracker content ...
</section>

<!-- PLATFORM TECHNOLOGY -->  ← Existing section
<section class="features-section">
    ... Platform Technology content ...
</section>

... (rest of content)
```

## Features

### Responsive Design
- Desktop: Full width with margins
- Tablet: Adapts to screen size
- Mobile: Stacks vertically

### Performance
- Lazy loading iframe
- Loads only when visible
- Smooth scrolling

### Styling
- Matches your platform aesthetic
- Uses existing CSS variables
- Consistent with other sections

## Testing

After insertion:

1. Open: `http://localhost:3000/index.html`
2. Scroll down past "Our Solution"
3. You should see:
   - Grove Tracker section header
   - Embedded map (600px height)
   - Full screen button
   - Feature highlights

## Customization

### Change Map Height
Edit the iframe container:
```html
<div style="... height: 600px; ...">  <!-- Change 600px -->
```

### Change Max Width
Edit the container:
```html
<div style="max-width: 1200px; ...">  <!-- Change 1200px -->
```

### Change Margins
Edit the padding:
```html
<div style="... padding: 0 20px; ...">  <!-- Change 20px -->
```

## Backup

The script automatically creates:
```
frontend/index.html.backup-grove-tracker
```

To restore:
```bash
copy frontend\index.html.backup-grove-tracker frontend\index.html
```

## Troubleshooting

### Issue: Section Already Exists
**Solution:** The script detects duplicates and won't insert twice

### Issue: Can't Find Insertion Point
**Solution:** Make sure "PLATFORM TECHNOLOGY" comment exists in index.html

### Issue: Map Not Loading
**Solution:** 
1. Check that grove-tracker.html exists
2. Verify server is running
3. Check browser console for errors

## Files Created

1. `grove-tracker-embed-section.html` - HTML to insert
2. `insert-grove-tracker.ps1` - PowerShell script
3. `insert-grove-tracker.bat` - Batch file wrapper
4. `GROVE-TRACKER-EMBED-GUIDE.md` - This guide

## Next Steps

1. ✅ Run `insert-grove-tracker.bat`
2. ✅ Open `http://localhost:3000/index.html`
3. ✅ Scroll to Grove Tracker section
4. ✅ Enjoy your embedded satellite map!

## Preview

Your index.html will now have:

1. **Hero Section** - "From Coffee Sippers to Coffee Investors"
2. **Problem Section** - The challenges
3. **Passion Section** - Your mission
4. **Our Solution** - Blockchain for Impact
5. **🌍 Grove Tracker** ← NEW! Embedded satellite map
6. **Platform Technology** - Hedera, IoT, etc.
7. **What Investors & Farmers Get**
8. **FAQ Section**
9. **Footer**

The Grove Tracker fits perfectly between Solution and Technology! 🎉
