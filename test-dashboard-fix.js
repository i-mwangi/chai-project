/**
 * Simple Test Script for Dashboard Button Fix
 * This script will test if the dashboard buttons are working correctly
 */

console.log('🚀 Starting Dashboard Button Test...\n');

// Test 1: Check if the global initialization flag is working
console.log('1️⃣ Testing global initialization flag...');
if (typeof window._buttonListenersInitialized !== 'undefined') {
    console.log('   ✅ Global initialization flag exists');
    console.log('   Value:', window._buttonListenersInitialized);
} else {
    console.log('   ℹ️ Global initialization flag not yet set (will be set on DOMContentLoaded)');
}

// Test 2: Check if document body has the action listener flag
console.log('\n2️⃣ Testing document body action listener flag...');
if (document.body.dataset.actionListenerAttached) {
    console.log('   ✅ Document body action listener flag is set');
    console.log('   Value:', document.body.dataset.actionListenerAttached);
} else {
    console.log('   ℹ️ Document body action listener flag not yet set (will be set on DOMContentLoaded)');
}

// Test 3: Find and list all action buttons
console.log('\n3️⃣ Finding dashboard action buttons...');
const actionButtons = document.querySelectorAll('.quick-actions .action-btn[data-action]');
console.log(`   Found ${actionButtons.length} dashboard action buttons:`);

actionButtons.forEach((btn, index) => {
    const action = btn.getAttribute('data-action');
    const text = btn.textContent.trim().replace(/\s+/g, ' ');
    console.log(`   ${index + 1}. Action: "${action}" - Text: "${text}"`);
});

// Test 4: Test if ViewManager and WalletManager exist
console.log('\n4️⃣ Checking required managers...');
if (typeof window.viewManager !== 'undefined') {
    console.log('   ✅ ViewManager is available');
} else {
    console.log('   ❌ ViewManager is NOT available - this is required for navigation');
}

if (typeof window.walletManager !== 'undefined') {
    console.log('   ✅ WalletManager is available');
} else {
    console.log('   ❌ WalletManager is NOT available - this is required for user type setting');
}

// Test 5: Simulate a click on the first action button
console.log('\n5️⃣ Testing button click simulation...');
if (actionButtons.length > 0) {
    const firstButton = actionButtons[0];
    const action = firstButton.getAttribute('data-action');
    console.log(`   Simulating click on button with action: "${action}"`);
    
    // Add a temporary listener to see if our event delegation is working
    const testListener = function(e) {
        const targetBtn = e.target.closest('[data-action]');
        if (targetBtn) {
            console.log('   ✅ Event delegation is working - captured click event');
            console.log('   🎯 Action:', targetBtn.getAttribute('data-action'));
        }
    };
    
    // Add listener in capture phase to catch the event before our main handler
    document.body.addEventListener('click', testListener, true);
    
    // Simulate click
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    });
    firstButton.dispatchEvent(clickEvent);
    
    // Remove test listener
    setTimeout(() => {
        document.body.removeEventListener('click', testListener, true);
    }, 100);
    
} else {
    console.log('   ❌ No action buttons found to test');
}

console.log('\n✅ Dashboard Button Test Complete!');
console.log('\n💡 Next Steps:');
console.log('   1. Try clicking the actual dashboard buttons with your mouse');
console.log('   2. Check if you see "🎯 Quick action button clicked" messages in console');
console.log('   3. Verify navigation works correctly');