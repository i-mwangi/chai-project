const fs = require('fs');

// Read as buffer
const buffer = fs.readFileSync('frontend/index.html');

// Convert buffer to string treating it as latin1 to preserve bytes
const text = buffer.toString('latin1');

// Now do string replacements - the corrupted sequences as they appear in latin1
const fixed = text
  .replace(/\xF0\x9F\x94\x94/g, '\u{1F514}')  // bell
  .replace(/\xF0\x9F\x92\xB0/g, '\u{1F4B0}')  // money bag
  .replace(/\xF0\x9F\x8C\xBF/g, '\u{1F33F}')  // herb
  .replace(/\xF0\x9F\xA4\x9D/g, '\u{1F91D}')  // handshake
  .replace(/\xF0\x9F\x8C\x8D/g, '\u{1F30D}')  // globe
  .replace(/\xF0\x9F\x9A\x80/g, '\u{1F680}')  // rocket
  .replace(/\xE2\x86\x92/g, '\u2192')         // arrow
  .replace(/\xF0\x9F\x9B\xB0\xEF\xB8\x8F/g, '\u{1F6F0}\uFE0F')  // satellite
  .replace(/\xF0\x9F\x93\x8D/g, '\u{1F4CD}')  // pin
  .replace(/\xE2\x9C\x93/g, '\u2713')         // check
  .replace(/\xE2\x96\xBE/g, '\u25BE')         // triangle
  .replace(/\xE2\x9A\x96\xEF\xB8\x8F/g, '\u2696\uFE0F')  // scales
  .replace(/\xE2\x80\x94/g, '\u2014');        // em dash

// Write as UTF-8
fs.writeFileSync('frontend/index.html', fixed, 'utf8');

console.log('✅ Fixed all encoding issues!');
