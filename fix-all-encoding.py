#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import codecs

# Read the file with latin-1 encoding (which preserves the corrupted bytes)
with codecs.open('frontend/index.html', 'r', encoding='latin-1') as f:
    content = f.read()

# Define all replacements - corrupted -> correct
replacements = {
    'ðŸ""': '🔔',      # bell
    'ðŸ'°': '💰',      # money bag
    'ðŸŒ¿': '🌿',      # herb
    'ðŸ¤': '🤝',       # handshake
    'ðŸŒ': '🌍',       # globe
    'ðŸš€': '🚀',      # rocket
    'â†'': '→',        # arrow
    'ðŸ›°ï¸': '🛰️',   # satellite
    'ðŸ"': '📍',       # pin
    'âœ"': '✓',        # check mark
    'â–¾': '▾',        # down triangle
    'âš–ï¸': '⚖️',    # scales
    'â€"': '—',        # em dash
}

# Apply all replacements
for corrupted, correct in replacements.items():
    content = content.replace(corrupted, correct)

# Write back with UTF-8 encoding
with codecs.open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Fixed all encoding issues in frontend/index.html')
print(f'   Applied {len(replacements)} replacements')
