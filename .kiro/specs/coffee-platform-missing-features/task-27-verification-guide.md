# Task 27: Notification System - Verification Guide

## Quick Verification Steps

### 1. Test Notification Manager Standalone
```bash
# Open the test file in a browser
open test-notifications.html
```

**Expected Results:**
- All notification types display correctly
- Notifications slide in from the right
- Auto-dismiss works after 5 seconds (except errors)
- Manual dismiss button works
- Action buttons trigger callbacks
- Multiple notifications stack properly

### 2. Test Distribution Claim Notification

**Steps:**
1. Open `frontend/app.html` in browser
2. Connect wallet as investor
3. Navigate to "Earnings" section
4. Click "Claim Earnings" on a pending distribution

**Expected:**
- Success notification appears with amount claimed
- Notification shows "Earnings Claimed" title
- Auto-dismisses after 7 seconds
- Balance updates after claim

### 3. Test Withdrawal Notification

**Steps:**
1. Connect wallet as farmer
2. Navigate to "Revenue" section
3. Submit a withdrawal request
4. Confirm withdrawal

**Expected:**
- Success notification appears with withdrawal amount
- Notification shows "Withdrawal Complete" title
- Auto-dismisses after 7 seconds
- Balance updates after withdrawal


### 4. Test Loan Health Warning

**Steps:**
1. Connect wallet as investor with active loan
2. Navigate to "Loans" section
3. View active loan details

**Expected:**
- If health factor < 1.2: Warning notification appears
- If health factor < 1.1: Critical error notification appears
- Notification does NOT auto-dismiss
- Action button "Manage Loan" or "Repay Loan" works
- Clicking action opens repay loan modal

### 5. Test Low Liquidity Alert

**Steps:**
1. Connect wallet as investor
2. Navigate to "Lending" section
3. View lending pools

**Expected:**
- If pool utilization >= 90%: Warning notification appears
- Notification shows pool name and utilization rate
- Notification does NOT auto-dismiss
- Action button "View Pools" works
- Multiple pools can trigger multiple notifications

## Code Verification

### Check NotificationManager is Loaded
```javascript
// In browser console
console.log(window.notificationManager);
// Should output: NotificationManager instance
```

### Check Integration Points
```javascript
// Test notification manually
window.notificationManager.success('Test notification');
window.notificationManager.error('Test error', { autoDismiss: false });
window.notificationManager.warning('Test warning', {
    title: 'Warning',
    action: () => alert('Action clicked'),
    actionLabel: 'Click Me'
});
```

## Files to Review

1. `frontend/js/notification-manager.js` - Core implementation
2. `frontend/styles/main.css` - Notification styles (bottom of file)
3. `frontend/app.html` - Script inclusion
4. `frontend/js/investor-portal.js` - Integration points
5. `frontend/js/farmer-dashboard.js` - Integration points
6. `test-notifications.html` - Test interface

## Common Issues

### Notifications Not Appearing
- Check browser console for errors
- Verify notification-manager.js is loaded before other scripts
- Check if notification container exists in DOM

### Styling Issues
- Clear browser cache
- Verify main.css is loaded
- Check for CSS conflicts with z-index

### Action Buttons Not Working
- Check callback function is defined
- Verify 'this' context in callbacks
- Check browser console for errors

## Success Criteria

- [x] NotificationManager class instantiated globally
- [x] All four notification types work
- [x] Auto-dismiss works correctly
- [x] Manual dismiss works
- [x] Action buttons trigger callbacks
- [x] Notifications stack properly
- [x] Distribution claims show notifications
- [x] Withdrawals show notifications
- [x] Loan health warnings show notifications
- [x] Low liquidity alerts show notifications
- [x] No console errors
- [x] Responsive on mobile devices
