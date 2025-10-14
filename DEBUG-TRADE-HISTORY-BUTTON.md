# Debug: View Trade History Button Not Working

## Steps to Debug

### 1. Restart Frontend
```bash
restart-frontend-server.bat
```

### 2. Open Browser Console (F12)
Look for these messages when the page loads:
```
[Marketplace] Looking for trade history button: <button>...
[Marketplace] Trade history button found, attaching listener
```

OR:
```
[Marketplace] Trade history button NOT found!
```

### 3. Check if Button Exists
In browser console, run:
```javascript
document.getElementById('viewTradeHistoryBtn')
```

**If it returns `null`:**
- Button doesn't exist in HTML
- Check if you're on the right section (Marketplace)

**If it returns the button element:**
- Button exists but listener not attached
- Timing issue

### 4. Manually Test the Function
In browser console, run:
```javascript
window.marketplace.loadTradeHistory()
```

**If it works:**
- Function is fine, just the button listener issue

**If it errors:**
- Function itself has a problem

### 5. Check Button Visibility
In browser console:
```javascript
const btn = document.getElementById('viewTradeHistoryBtn');
console.log('Button:', btn);
console.log('Visible:', btn.offsetParent !== null);
console.log('Disabled:', btn.disabled);
console.log('Pointer events:', window.getComputedStyle(btn).pointerEvents);
```

### 6. Manually Attach Listener
If button exists but doesn't work, try:
```javascript
const btn = document.getElementById('viewTradeHistoryBtn');
btn.addEventListener('click', () => {
    console.log('Manual click!');
    window.marketplace.loadTradeHistory();
});
```

Then click the button.

## Possible Issues

### Issue 1: Button Not in DOM
**Symptom**: Console shows "button NOT found"
**Solution**: Check HTML file has the button with correct ID

### Issue 2: Timing Problem
**Symptom**: Button exists but listener not attached
**Solution**: Already added setTimeout in code

### Issue 3: CSS Blocking Clicks
**Symptom**: Button visible but not clickable
**Check**:
```javascript
const btn = document.getElementById('viewTradeHistoryBtn');
console.log(window.getComputedStyle(btn).pointerEvents);
```
Should be "auto", not "none"

### Issue 4: Overlay Blocking
**Symptom**: Something covering the button
**Check**: Use browser DevTools inspector to see z-index layers

### Issue 5: Wrong Section
**Symptom**: Looking at wrong marketplace section
**Solution**: Make sure you're in Investor Dashboard → Marketplace

## Quick Fix

If nothing works, add this to browser console:
```javascript
// Force attach listener
setTimeout(() => {
    const btn = document.getElementById('viewTradeHistoryBtn');
    if (btn) {
        btn.onclick = () => {
            console.log('Forced click!');
            window.marketplace.loadTradeHistory();
        };
        console.log('Listener forced!');
    }
}, 1000);
```

## What Should Happen

When button works correctly:
1. Click "View Trade History"
2. Console shows: `[Marketplace] View Trade History clicked`
3. Trade history section toggles visibility
4. Shows list of past trades (or "No trades yet")

## Alternative: Use Event Delegation

If button still doesn't work, we can use event delegation on the parent:
```javascript
document.addEventListener('click', (e) => {
    if (e.target.id === 'viewTradeHistoryBtn') {
        console.log('Delegated click!');
        window.marketplace.loadTradeHistory();
    }
});
```

## Share Debug Info

Please run these in console and share results:
```javascript
// 1. Check button
console.log('Button:', document.getElementById('viewTradeHistoryBtn'));

// 2. Check marketplace object
console.log('Marketplace:', window.marketplace);

// 3. Check function
console.log('Function:', typeof window.marketplace.loadTradeHistory);

// 4. Try calling directly
window.marketplace.loadTradeHistory();
```

This will help identify exactly where the problem is!
