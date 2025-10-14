const fs = require('fs');

// Read the file
const filePath = 'frontend/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// Define replacements - corrupted emoji -> correct emoji
const replacements = [
    ['ðŸ""', '🔔'],
    ['ðŸ'°', '💰'],
    ['ðŸŒ¿', '🌿'],
    ['ðŸ¤', '🤝'],
    ['ðŸŒ', '🌍'],
    ['ðŸš€', '🚀'],
    ['â†'', '→'],
    ['ðŸ›°ï¸', '🛰️'],
    ['ðŸ"', '📍']
];

// Apply all replacements
replacements.forEach(([corrupted, correct]) => {
    content = content.split(corrupted).join(correct);
});

// Write back with UTF-8 encoding
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed emoji encoding in', filePath);
