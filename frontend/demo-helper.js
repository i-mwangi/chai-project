/**
 * Demo Helper Functions
 * Utility functions to help demonstrate the platform features
 */

window.demoHelper = {
    // Force connect as farmer
    connectAsFarmer() {
        localStorage.setItem('connectedAccount', '0.0.123456');
        localStorage.setItem('userType', 'farmer');
        location.reload();
    },

    // Force connect as investor  
    connectAsInvestor() {
        localStorage.setItem('connectedAccount', '0.0.789012');
        localStorage.setItem('userType', 'investor');
        location.reload();
    },

    // Reset and disconnect
    reset() {
        localStorage.clear();
        location.reload();
    },

    // Show demo instructions
    showInstructions() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4>🎯 Demo Instructions</h4>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <h5>How to Test the Platform:</h5>
                    
                    <div class="demo-section">
                        <h6>👨‍🌾 Test as Farmer:</h6>
                        <ul>
                            <li>Click "Connect as Farmer" below</li>
                            <li>Navigate to "Farmer Portal"</li>
                            <li>Try registering a new grove</li>
                            <li>Report a harvest</li>
                            <li>Check revenue tracking</li>
                        </ul>
                        <button class="btn btn-primary" onclick="demoHelper.connectAsFarmer()">
                            Connect as Farmer
                        </button>
                    </div>
                    
                    <div class="demo-section">
                        <h6>💰 Test as Investor:</h6>
                        <ul>
                            <li>Click "Connect as Investor" below</li>
                            <li>Navigate to "Investor Portal"</li>
                            <li>Browse available groves</li>
                            <li>Try purchasing tokens</li>
                            <li>Check portfolio and marketplace</li>
                        </ul>
                        <button class="btn btn-primary" onclick="demoHelper.connectAsInvestor()">
                            Connect as Investor
                        </button>
                    </div>
                    
                    <div class="demo-section">
                        <h6>🔄 Reset Demo:</h6>
                        <p>Clear all data and start over</p>
                        <button class="btn btn-secondary" onclick="demoHelper.reset()">
                            Reset Demo
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
};

// Add demo button to page
document.addEventListener('DOMContentLoaded', () => {
    const demoBtn = document.createElement('button');
    demoBtn.textContent = '🎯 Demo Helper';
    demoBtn.className = 'demo-helper-btn';
    demoBtn.onclick = () => window.demoHelper.showInstructions();
    
    demoBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #8B4513;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    demoBtn.addEventListener('mouseenter', () => {
        demoBtn.style.transform = 'scale(1.05)';
        demoBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });
    
    demoBtn.addEventListener('mouseleave', () => {
        demoBtn.style.transform = 'scale(1)';
        demoBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });
    
    document.body.appendChild(demoBtn);
});