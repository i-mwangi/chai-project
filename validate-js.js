// Simple JavaScript validation script
import fs from 'fs';
import path from 'path';

const jsFiles = [
    'frontend/js/main.js',
    'frontend/js/farmer-dashboard.js',
    'frontend/js/investor-portal.js',
    'frontend/js/wallet.js',
    'frontend/js/api.js',
    'frontend/js/marketplace.js'
];

jsFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        // Try to parse as JavaScript
        new Function(content);
        console.log(`✅ ${file} - Syntax OK`);
    } catch (error) {
        console.error(`❌ ${file} - Syntax Error:`, error.message);
    }
});