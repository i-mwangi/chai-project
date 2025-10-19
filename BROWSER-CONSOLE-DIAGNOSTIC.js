// 🔍 Paste this in your browser console (F12) to diagnose the issue

console.log('=== 🔍 Chai Platform Diagnostic ===\n');

// Check 1: WalletManager exists
console.log('1️⃣ Checking window.walletManager...');
if (typeof window.walletManager === 'undefined') {
    console.error('❌ window.walletManager is UNDEFINED');
    console.log('   → wallet.js or src/main.js may not be loaded');
} else {
    console.log('✅ window.walletManager exists');
    console.log('   Type:', typeof window.walletManager);
}

// Check 2: setIntendedUserType method
console.log('\n2️⃣ Checking setIntendedUserType method...');
if (typeof window.walletManager?.setIntendedUserType === 'undefined') {
    console.error('❌ setIntendedUserType method is MISSING');
    console.log('   → This is why navigation buttons don\'t work!');
} else {
    console.log('✅ setIntendedUserType method exists');
    console.log('   Type:', typeof window.walletManager.setIntendedUserType);
}

// Check 3: ViewManager exists
console.log('\n3️⃣ Checking window.viewManager...');
if (typeof window.viewManager === 'undefined') {
    console.error('❌ window.viewManager is UNDEFINED');
    console.log('   → main.js may not be loaded or initialized');
} else {
    console.log('✅ window.viewManager exists');
    console.log('   Type:', typeof window.viewManager);
}

// Check 4: Navigation buttons
console.log('\n4️⃣ Checking navigation buttons...');
const navButtons = document.querySelectorAll('.nav-btn');
console.log(`Found ${navButtons.length} navigation buttons`);
navButtons.forEach((btn, index) => {
    const view = btn.dataset.view;
    const hasListener = btn.onclick !== null;
    console.log(`   Button ${index + 1}: view="${view}", hasListener=${hasListener}`);
});

// Check 5: Quick action buttons
console.log('\n5️⃣ Checking quick action buttons...');
const actionButtons = document.querySelectorAll('.action-btn');
console.log(`Found ${actionButtons.length} action buttons`);
actionButtons.forEach((btn, index) => {
    const text = btn.textContent.trim();
    const hasOnclick = btn.onclick !== null || btn.getAttribute('onclick') !== null;
    console.log(`   Button ${index + 1}: "${text}", hasOnclick=${hasOnclick}`);
});

// Check 6: Test setIntendedUserType
console.log('\n6️⃣ Testing setIntendedUserType...');
if (window.walletManager?.setIntendedUserType) {
    try {
        window.walletManager.setIntendedUserType('farmer');
        console.log('✅ Successfully set intended user type to "farmer"');

        window.walletManager.setIntendedUserType('investor');
        console.log('✅ Successfully set intended user type to "investor"');
    } catch (error) {
        console.error('❌ Error calling setIntendedUserType:', error);
    }
} else {
    console.error('❌ Cannot test - method does not exist');
}

// Check 7: Script loading
console.log('\n7️⃣ Checking loaded scripts...');
const scripts = Array.from(document.querySelectorAll('script[src]'));
const relevantScripts = scripts.filter(s =>
    s.src.includes('wallet') ||
    s.src.includes('main.js') ||
    s.src.includes('view')
);
console.log('Relevant scripts loaded:');
relevantScripts.forEach(script => {
    console.log(`   - ${script.src}`);
});

// Summary
console.log('\n=== 📊 Summary ===');
const checks = [
    typeof window.walletManager !== 'undefined',
    typeof window.walletManager?.setIntendedUserType !== 'undefined',
    typeof window.viewManager !== 'undefined',
    navButtons.length > 0
];
const passed = checks.filter(Boolean).length;
const total = checks.length;

if (passed === total) {
    console.log(`✅ All checks passed (${passed}/${total})`);
    console.log('🎉 Everything should be working!');
    console.log('\nTry clicking a navigation button now.');
} else {
    console.log(`⚠️ ${passed}/${total} checks passed`);
    console.log('❌ Some issues detected - see details above');
    console.log('\n💡 Solution: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)');
}

console.log('\n=== End Diagnostic ===');
