/**
 * Image Optimization Script
 * Adds lazy loading attributes to images in HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function optimizeHtmlFile(filePath) {
    console.log(`${colors.cyan}Processing: ${filePath}${colors.reset}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;

    // Add loading="lazy" to img tags that don't have it
    // Skip images that are above the fold (hero images)
    const imgRegex = /<img\s+([^>]*?)(?<!loading=["']lazy["'])>/gi;

    content = content.replace(imgRegex, (match, attributes) => {
        // Skip if already has loading attribute
        if (attributes.includes('loading=')) {
            return match;
        }

        // Skip hero images (first few images on page)
        if (attributes.includes('hero') || attributes.includes('logo')) {
            return match;
        }

        changes++;
        return `<img ${attributes} loading="lazy">`;
    });

    // Add decoding="async" to images for better performance
    const imgWithoutDecodingRegex = /<img\s+([^>]*?)(?<!decoding=["']async["'])>/gi;

    content = content.replace(imgWithoutDecodingRegex, (match, attributes) => {
        // Skip if already has decoding attribute
        if (attributes.includes('decoding=')) {
            return match;
        }

        // Skip SVGs
        if (attributes.includes('.svg')) {
            return match;
        }

        return `<img ${attributes} decoding="async">`;
    });

    if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`${colors.green}✓ Added lazy loading to ${changes} images${colors.reset}`);
    } else {
        console.log(`${colors.yellow}○ No changes needed${colors.reset}`);
    }

    return changes;
}

function optimizeDirectory(dirPath) {
    console.log(`${colors.bright}${colors.cyan}🖼️  Image Optimization${colors.reset}\n`);

    const htmlFiles = [
        path.join(dirPath, 'index.html'),
        path.join(dirPath, 'app.html'),
    ];

    let totalChanges = 0;

    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            totalChanges += optimizeHtmlFile(file);
        } else {
            console.log(`${colors.yellow}⚠ File not found: ${file}${colors.reset}`);
        }
    });

    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`Total images optimized: ${colors.green}${totalChanges}${colors.reset}`);

    if (totalChanges > 0) {
        console.log(`\n${colors.green}✅ Image optimization complete!${colors.reset}`);
        console.log(`\nBenefits:`);
        console.log(`  • Faster initial page load`);
        console.log(`  • Reduced bandwidth usage`);
        console.log(`  • Better mobile experience`);
        console.log(`  • Improved Lighthouse score`);
    }
}

// Run optimization
const frontendPath = path.join(__dirname, 'frontend');
optimizeDirectory(frontendPath);
