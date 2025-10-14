// Debug script for investor portal buttons
// Run this in the browser console

console.log('=== Investor Portal Debug ===');

// Check if investorPortal exists
console.log('1. window.investorPortal exists:', typeof window.investorPortal !== 'undefined');

if (window.investorPortal) {
    console.log('2. Available groves:', window.investorPortal.availableGroves?.length || 0);
    console.log('3. Current section:', window.investorPortal.currentSection);
    
    // Check if groves are rendered
    const container = document.getElementById('grovesMarketplace');
    console.log('4. Groves container exists:', !!container);
    
    if (container) {
        console.log('5. Container HTML length:', container.innerHTML.length);
        console.log('6. Number of marketplace cards:', container.querySelectorAll('.marketplace-card').length);
        console.log('7. Number of detail buttons:', container.querySelectorAll('.grove-details-btn').length);
        console.log('8. Number of invest buttons:', container.querySelectorAll('.grove-invest-btn').length);
        
        // Check if buttons have event listeners
        const detailBtn = container.querySelector('.grove-details-btn');
        const investBtn = container.querySelector('.grove-invest-btn');
        
        if (detailBtn) {
            console.log('9. First detail button data-grove-id:', detailBtn.dataset.groveId);
            console.log('10. Detail button classes:', detailBtn.className);
        } else {
            console.log('9-10. No detail buttons found');
        }
        
        if (investBtn) {
            console.log('11. First invest button data-grove-id:', investBtn.dataset.groveId);
            console.log('12. Invest button classes:', investBtn.className);
        } else {
            console.log('11-12. No invest buttons found');
        }
    }
    
    // Try to manually trigger loadAvailableGroves
    console.log('\n13. Attempting to reload groves...');
    window.investorPortal.loadAvailableGroves().then(() => {
        console.log('14. Groves reloaded successfully');
        console.log('15. Available groves after reload:', window.investorPortal.availableGroves?.length || 0);
    }).catch(err => {
        console.error('14-15. Error reloading groves:', err);
    });
} else {
    console.error('investorPortal not found on window object!');
}

console.log('\n=== End Debug ===');
