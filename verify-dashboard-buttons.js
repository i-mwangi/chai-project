/**
 * Verification Script for Dashboard Button Fix
 * Run this in the browser console (F12) after loading the app
 */

console.log('🔍 Starting Dashboard Button Verification...\n');

// Test 1: Check if main.js is loaded
console.log('1️⃣ Checking if ViewManager exists...');
if (typeof window.viewManager !== 'undefined') {
    console.log('   ✅ ViewManager is loaded');
    console.log('   Type:', typeof window.viewManager);
    console.log('   Has switchView method:', typeof window.viewManager.switchView === 'function');
} else {
    console.error('   ❌ ViewManager is NOT loaded');
    console.error('   → main.js may not be loaded or initialized');
}

// Test 2: Check if WalletManager exists
console.log('\n2️⃣ Checking if WalletManager exists...');
if (typeof window.walletManager !== 'undefined') {
    console.log('   ✅ WalletManager is loaded');
    console.log('   Has setIntendedUserType:', typeof window.walletManager.setIntendedUserType === 'function');
} else {
    console.error('   ❌ WalletManager is NOT loaded');
}

// Test 3: Find all action buttons
console.log('\n3️⃣ Finding action buttons...');
const actionButtons = document.querySelectorAll('[data-action]');
console.log(`   Found ${actionButtons.length} buttons with data-action attribute`);

if (actionButtons.length > 0) {
    actionButtons.forEach((btn, index) => {
        const action = btn.getAttribute('data-action');
        const text = btn.textContent.trim().replace(/\s+/g, ' ').substring(0, 30);
        console.log(`   Button ${index + 1}: action="${action}", text="${text}"`);
    });
} else {
    console.error('   ❌ No action buttons found!');
}

// Test 4: Check duplicate prevention flags
console.log('\n4️⃣ Checking duplicate prevention system...');
const checks = {
    'ViewManager loaded': typeof window.viewManager !== 'undefined',
    'WalletManager loaded': typeof window.walletManager !== 'undefined',
    'Action buttons found': actionButtons.length > 0,
    'Global init flag set': window._buttonListenersInitialized === true,
    'Body listener flag set': document.body.dataset.actionListenerAttached === 'true'
};

let passed = 0;
let total = 0;

for (const [check, result] of Object.entries(checks)) {
    total++;
    if (result) {
        passed++;
        console.log(`✅ ${check}`);
    } else {
        console.log(`❌ ${check}`);
    }
}

console.log('═══════════════════════════════════════');
console.log(`Result: ${passed}/${total} checks passed`);

if (passed === total) {
    console.log('\n🎉 All checks passed! Buttons should work correctly.');
    console.log('\n💡 Next steps:');
    console.log('   1. Click any "Browse Groves" or "View Marketplace" button');
    console.log('   2. Verify the view switches correctly');
    console.log('   3. Check console for "🎯 Quick action button clicked" messages');
    console.log('   4. Verify clicks only fire ONCE (no duplicates)');
} else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Hard refresh the page (Ctrl+Shift+R)');
    console.log('   2. Clear browser cache completely');
    console.log('   3. Check Network tab for failed script loads');
    console.log('   4. Verify main.js is loaded in the Sources tab');
    console.log('   5. Check for JavaScript errors in console');
}

console.log('\n✅ Verification complete!');
console.log('💡 Click any action button within 5 seconds to test duplicate prevention');

// Test 5: Test event delegation
console.log('\n5️⃣ Testing event delegation...');
let clickCount = 0;

// Add a temporary counter to verify clicks are only handled once
const testListener = function(e) {
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
        clickCount++;
        console.log(`   📊 Click detected (count: ${clickCount})`);
        if (clickCount > 1) {
            console.error('   ❌ DUPLICATE CLICK DETECTED! Event fired multiple times!');
        }
    }
};

document.body.addEventListener('click', testListener, true);

console.log('   ℹ️  Click any action button to test...');
console.log('   (Test listener will count clicks - should only be 1 per click)');

// Auto-remove after 5 seconds
setTimeout(() => {
    document.body.removeEventListener('click', testListener, true);
    console.log('   ℹ️  Test listener removed');
}, 5000);

// Test 6: Simulate a click programmatically
console.log('\n6️⃣ Simulating programmatic click...');
const firstActionBtn = document.querySelector('[data-action]');
if (firstActionBtn) {
    const action = firstActionBtn.getAttribute('data-action');
    console.log(`   Found button with action: "${action}"`);
    console.log('   Attempting to trigger click event...');
    
    // Reset click count
    clickCount = 0;
    
    // Create and dispatch a click event
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    
    firstActionBtn.dispatchEvent(clickEvent);
    
    // Check result after a short delay
    setTimeout(() => {
        if (clickCount === 1) {
            console.log('   ✅ Programmatic click worked correctly (fired exactly once)');
        } else if (clickCount === 0) {
            console.error('   ❌ Programmatic click did not fire at all');
        } else {
            console.error(`   ❌ Programmatic click fired ${clickCount} times (should be 1)`);
        }
    }, 500);
} else {
    console.error('   ❌ No action buttons found to test');
}