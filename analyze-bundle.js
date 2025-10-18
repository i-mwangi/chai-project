/**
 * Bundle Size Analysis Script
 * Analyzes the production build and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFilesRecursive(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getFilesRecursive(filePath, fileList);
        } else {
            fileList.push({
                path: filePath,
                name: file,
                size: stat.size,
                ext: path.extname(file)
            });
        }
    });
    
    return fileList;
}

function analyzeBundle() {
    const distPath = path.join(__dirname, 'frontend', 'dist');
    
    if (!fs.existsSync(distPath)) {
        console.log(`${colors.red}Error: Build directory not found at ${distPath}${colors.reset}`);
        console.log('Please run "npm run frontend:build" first.');
        return;
    }
    
    console.log(`${colors.bright}${colors.cyan}📊 Bundle Size Analysis${colors.reset}\n`);
    
    const files = getFilesRecursive(distPath);
    
    // Categorize files
    const categories = {
        js: files.filter(f => f.ext === '.js'),
        css: files.filter(f => f.ext === '.css'),
        html: files.filter(f => f.ext === '.html'),
        images: files.filter(f => ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(f.ext)),
        other: files.filter(f => !['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(f.ext))
    };
    
    // Calculate totals
    const totals = {
        js: categories.js.reduce((sum, f) => sum + f.size, 0),
        css: categories.css.reduce((sum, f) => sum + f.size, 0),
        html: categories.html.reduce((sum, f) => sum + f.size, 0),
        images: categories.images.reduce((sum, f) => sum + f.size, 0),
        other: categories.other.reduce((sum, f) => sum + f.size, 0)
    };
    
    const totalSize = Object.values(totals).reduce((sum, size) => sum + size, 0);
    
    // Display summary
    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`Total Size: ${colors.bright}${formatBytes(totalSize)}${colors.reset}`);
    console.log(`Total Files: ${colors.bright}${files.length}${colors.reset}\n`);
    
    // Display by category
    console.log(`${colors.bright}By Category:${colors.reset}`);
    Object.entries(totals).forEach(([category, size]) => {
        const percentage = ((size / totalSize) * 100).toFixed(1);
        const color = size > 1024 * 1024 ? colors.yellow : colors.green;
        console.log(`  ${category.toUpperCase().padEnd(10)} ${color}${formatBytes(size).padEnd(12)}${colors.reset} (${percentage}%)`);
    });
    console.log();
    
    // Display largest files
    console.log(`${colors.bright}Largest Files:${colors.reset}`);
    const sortedFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 10);
    sortedFiles.forEach((file, index) => {
        const relativePath = path.relative(distPath, file.path);
        const color = file.size > 500 * 1024 ? colors.red : file.size > 100 * 1024 ? colors.yellow : colors.green;
        console.log(`  ${(index + 1).toString().padStart(2)}. ${color}${formatBytes(file.size).padEnd(12)}${colors.reset} ${relativePath}`);
    });
    console.log();
    
    // Analyze JS bundles
    console.log(`${colors.bright}JavaScript Bundles:${colors.reset}`);
    const jsBundles = categories.js.sort((a, b) => b.size - a.size);
    jsBundles.forEach(file => {
        const relativePath = path.relative(distPath, file.path);
        const color = file.size > 500 * 1024 ? colors.red : file.size > 100 * 1024 ? colors.yellow : colors.green;
        console.log(`  ${color}${formatBytes(file.size).padEnd(12)}${colors.reset} ${relativePath}`);
    });
    console.log();
    
    // Recommendations
    console.log(`${colors.bright}${colors.cyan}💡 Optimization Recommendations:${colors.reset}\n`);
    
    const recommendations = [];
    
    // Check for large JS bundles
    const largeJsBundles = jsBundles.filter(f => f.size > 500 * 1024);
    if (largeJsBundles.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Code Splitting',
            issue: `${largeJsBundles.length} JavaScript bundle(s) larger than 500 KB`,
            suggestion: 'Consider lazy loading HashConnect for users who don\'t connect immediately',
            impact: 'Could reduce initial load by ~1 MB (gzipped)'
        });
    }
    
    // Check for large images
    const largeImages = categories.images.filter(f => f.size > 100 * 1024);
    if (largeImages.length > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Image Optimization',
            issue: `${largeImages.length} image(s) larger than 100 KB`,
            suggestion: 'Compress images using tools like ImageOptim or convert to WebP format',
            impact: `Could reduce image size by 30-50% (~${formatBytes(totals.images * 0.4)})`
        });
    }
    
    // Check total bundle size
    if (totals.js > 2 * 1024 * 1024) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Bundle Size',
            issue: `Total JavaScript size is ${formatBytes(totals.js)}`,
            suggestion: 'Implement route-based code splitting for farmer and investor portals',
            impact: 'Could reduce initial load by 20-30%'
        });
    }
    
    // Check for duplicate code
    recommendations.push({
        priority: 'LOW',
        category: 'Code Deduplication',
        issue: 'Potential duplicate code across bundles',
        suggestion: 'Review shared dependencies and consider creating a common chunk',
        impact: 'Could reduce total size by 5-10%'
    });
    
    // Display recommendations
    recommendations.forEach((rec, index) => {
        const priorityColor = rec.priority === 'HIGH' ? colors.red : rec.priority === 'MEDIUM' ? colors.yellow : colors.green;
        console.log(`${index + 1}. ${priorityColor}[${rec.priority}]${colors.reset} ${colors.bright}${rec.category}${colors.reset}`);
        console.log(`   Issue: ${rec.issue}`);
        console.log(`   Suggestion: ${rec.suggestion}`);
        console.log(`   Impact: ${colors.green}${rec.impact}${colors.reset}\n`);
    });
    
    // Performance score
    console.log(`${colors.bright}${colors.cyan}📈 Performance Score:${colors.reset}\n`);
    
    let score = 100;
    let scoreBreakdown = [];
    
    // Deduct points for large bundles
    if (totals.js > 2 * 1024 * 1024) {
        const deduction = Math.min(20, Math.floor((totals.js - 2 * 1024 * 1024) / (100 * 1024)));
        score -= deduction;
        scoreBreakdown.push(`-${deduction} points: Large JavaScript bundles`);
    }
    
    // Deduct points for large images
    if (totals.images > 5 * 1024 * 1024) {
        const deduction = Math.min(15, Math.floor((totals.images - 5 * 1024 * 1024) / (500 * 1024)));
        score -= deduction;
        scoreBreakdown.push(`-${deduction} points: Large image files`);
    }
    
    // Bonus points for good practices
    if (jsBundles.some(f => f.name.includes('vendor'))) {
        score += 5;
        scoreBreakdown.push(`+5 points: Vendor code splitting implemented`);
    }
    
    if (categories.css.length > 0 && categories.css.every(f => f.size < 200 * 1024)) {
        score += 5;
        scoreBreakdown.push(`+5 points: CSS properly extracted and sized`);
    }
    
    const scoreColor = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
    console.log(`  Overall Score: ${scoreColor}${colors.bright}${score}/100${colors.reset}`);
    console.log();
    scoreBreakdown.forEach(item => console.log(`  ${item}`));
    console.log();
    
    // Final verdict
    if (score >= 80) {
        console.log(`${colors.green}✅ Bundle is well-optimized for production!${colors.reset}`);
    } else if (score >= 60) {
        console.log(`${colors.yellow}⚠️  Bundle is acceptable but could be improved.${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ Bundle needs optimization before production deployment.${colors.reset}`);
    }
    console.log();
}

// Run analysis
try {
    analyzeBundle();
} catch (error) {
    console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
    process.exit(1);
}
