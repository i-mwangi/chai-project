const fs = require('fs');

// Read the file as UTF-8 string
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Direct string replacements - these are the actual corrupted strings as UTF-8
const replacements = [
  ['ðŸ""', '🔔'],      // bell
  ['ðŸ'°', '💰'],      // money bag
  ['ðŸŒ¿', '🌿'],      // herb
  ['ðŸ¤', '🤝'],       // handshake
  ['ðŸŒ', '🌍'],       // globe
  ['ðŸš€', '🚀'],      // rocket
  ['â†'', '→'],        // arrow
  ['ðŸ›°ï¸', '🛰️'],   // satellite
  ['ðŸ"', '📍'],       // pin
  ['âœ"', '✓'],        // check mark
  ['â–¾', '▾'],        // down triangle
  ['âš–ï¸', '⚖️'],    // scales
  ['â€"', '—'],        // em dash
];

let count = 0;
replacements.forEach(([bad, good]) => {
  const before = content;
  content = content.split(bad).join(good);
  if (content !== before) {
    count++;
    console.log(`Fixed: ${bad} -> ${good}`);
  }
});

// Write back as UTF-8
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log(`\n✅ Fixed ${count} types of encoding issues!`);
