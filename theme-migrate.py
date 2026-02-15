#!/usr/bin/env python3
"""Atlas Theme Migration: Warm Earth → Dark Luxury (single-pass per file)"""
import os, re, glob

REPLACEMENTS = [
    # BACKGROUNDS
    ('bg-[#E6D4C7]', 'bg-[#0A0A0A]'),
    ('bg-[#F5F2E8]', 'bg-[#111111]'),
    ('bg-[#E8E3CC]', 'bg-[#111111]'),
    ('bg-[#DDD7C0]', 'bg-[#161616]'),
    ('bg-[#D4CDB8]', 'bg-[#1A1A1A]'),
    ('bg-[#D4CEB8]', 'bg-[#1A1A1A]'),
    ('bg-[#C5BDA8]', 'bg-[#1A1A1A]'),
    ('bg-[#9C4A29]', 'bg-[#CDB49E]'),
    ('bg-[#B85A35]', 'bg-[#E8D5B7]'),
    ('bg-[#7D3B21]', 'bg-[#B89B78]'),
    ('bg-[#273B3A]', 'bg-[#161616]'),
    ('bg-[#2D1810]', 'bg-[#111111]'),
    ('bg-[#3D2820]', 'bg-[#1A1A1A]'),
    # TEXT
    ('text-[#273B3A]', 'text-[#FAFAFA]'),
    ('text-[#2D1810]', 'text-[#FAFAFA]'),
    ('text-[#6B5B4F]', 'text-[#999999]'),
    ('text-[#1A0E09]', 'text-[#FAFAFA]'),
    ('text-[#9C4A29]', 'text-[#CDB49E]'),
    ('text-[#B85A35]', 'text-[#E8D5B7]'),
    ('text-[#7D3B21]', 'text-[#B89B78]'),
    ('text-[#E6D4C7]', 'text-[#0A0A0A]'),
    ('text-[#F5F2E8]', 'text-[#0A0A0A]'),
    ('text-[#E8E3CC]', 'text-[#FAFAFA]'),
    # BORDERS
    ('border-[#E6D4C7]', 'border-[#262626]'),
    ('border-[#D4CDB8]', 'border-[#1E1E1E]'),
    ('border-[#D4CEB8]', 'border-[#1E1E1E]'),
    ('border-[#DDD7C0]', 'border-[#262626]'),
    ('border-[#F5F2E8]', 'border-[#1E1E1E]'),
    ('border-[#9C4A29]', 'border-[#CDB49E]'),
    ('border-[#273B3A]', 'border-[#262626]'),
    ('border-[#B85A35]', 'border-[#CDB49E]'),
    # GRADIENTS
    ('from-[#273B3A]', 'from-[#CDB49E]'),
    ('to-[#273B3A]', 'to-[#B89B78]'),
    ('from-[#9C4A29]', 'from-[#CDB49E]'),
    ('to-[#9C4A29]', 'to-[#B89B78]'),
    ('from-[#B85A35]', 'from-[#E8D5B7]'),
    ('to-[#B85A35]', 'to-[#CDB49E]'),
    ('from-[#7D3B21]', 'from-[#B89B78]'),
    ('to-[#7D3B21]', 'to-[#9A8670]'),
    # HOVER
    ('hover:bg-[#E6D4C7]', 'hover:bg-[#1A1A1A]'),
    ('hover:bg-[#F5F2E8]', 'hover:bg-[#1A1A1A]'),
    ('hover:bg-[#DDD7C0]', 'hover:bg-[#262626]'),
    ('hover:bg-[#9C4A29]', 'hover:bg-[#E8D5B7]'),
    ('hover:bg-[#273B3A]', 'hover:bg-[#1A1A1A]'),
    ('hover:bg-[#3D2820]', 'hover:bg-[#262626]'),
    ('hover:text-[#273B3A]', 'hover:text-[#FAFAFA]'),
    ('hover:text-[#9C4A29]', 'hover:text-[#CDB49E]'),
    ('hover:border-[#9C4A29]', 'hover:border-[#CDB49E]'),
    # RING/FOCUS
    ('ring-[#9C4A29]', 'ring-[#CDB49E]'),
    ('ring-[#273B3A]', 'ring-[#CDB49E]'),
    # UTILITY CLASSES
    ('bg-cream-light', 'bg-[#111111]'),
    ('bg-cream-dark', 'bg-[#161616]'),
    ('bg-cream', 'bg-[#0A0A0A]'),
    ('bg-cinnamon-light', 'bg-[#E8D5B7]'),
    ('bg-cinnamon-dark', 'bg-[#B89B78]'),
    ('bg-cinnamon', 'bg-[#CDB49E]'),
    ('text-earth-muted', 'text-[#888888]'),
    ('text-earth-light', 'text-[#999999]'),
    ('text-earth', 'text-[#FAFAFA]'),
    ('text-cream', 'text-[#0A0A0A]'),
    ('text-cinnamon', 'text-[#CDB49E]'),
    ('border-cream', 'border-[#262626]'),
    ('border-cinnamon', 'border-[#CDB49E]'),
    ('shadow-warm-lg', 'shadow-dark-lg'),
    ('shadow-warm', 'shadow-dark'),
    ('shadow-cinnamon', 'shadow-gold'),
    ('glass-cream', 'glass-dark'),
    ('card-cream', 'card-dark'),
    ('animate-pulse-cinnamon', 'animate-pulse-gold'),
    # RGBA
    ('rgba(156, 74, 41', 'rgba(205, 180, 158'),
    ('rgba(45, 24, 16', 'rgba(0, 0, 0'),
    # INLINE STYLES - single quotes
    ("backgroundColor: '#E6D4C7'", "backgroundColor: '#0A0A0A'"),
    ("backgroundColor: '#F5F2E8'", "backgroundColor: '#111111'"),
    ("backgroundColor: '#273B3A'", "backgroundColor: '#161616'"),
    ("backgroundColor: '#9C4A29'", "backgroundColor: '#CDB49E'"),
    ("background: '#E6D4C7'", "background: '#0A0A0A'"),
    ("background: '#273B3A'", "background: '#161616'"),
    ("color: '#273B3A'", "color: '#FAFAFA'"),
    ("color: '#E6D4C7'", "color: '#0A0A0A'"),
    ("color: '#9C4A29'", "color: '#CDB49E'"),
    ("color: '#2D1810'", "color: '#FAFAFA'"),
    ("borderColor: '#D4CDB8'", "borderColor: '#262626'"),
    ("borderColor: '#E6D4C7'", "borderColor: '#262626'"),
    # INLINE STYLES - double quotes
    ('backgroundColor: "#E6D4C7"', 'backgroundColor: "#0A0A0A"'),
    ('backgroundColor: "#273B3A"', 'backgroundColor: "#161616"'),
    ('background: "#E6D4C7"', 'background: "#0A0A0A"'),
    ('color: "#273B3A"', 'color: "#FAFAFA"'),
    ('color: "#E6D4C7"', 'color: "#0A0A0A"'),
    ('color: "#9C4A29"', 'color: "#CDB49E"'),
    # RAW HEX (remaining inline references)
    ('#E6D4C7', '#0A0A0A'),
    ('#F5F2E8', '#111111'),
    ('#D4CDB8', '#1E1E1E'),
    ('#D4CEB8', '#1E1E1E'),
    ('#9C4A29', '#CDB49E'),
    ('#B85A35', '#E8D5B7'),
    ('#7D3B21', '#B89B78'),
    ('#2D1810', '#111111'),
    ('#3D2820', '#1A1A1A'),
]

# Sort by length (longest first) to avoid partial matches
REPLACEMENTS.sort(key=lambda x: -len(x[0]))

def migrate_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        return True
    return False

# Find all .tsx and .ts files
files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

# Exclude already-migrated files
skip = {'src/app/globals.css', 'tailwind.config.ts'}

changed = 0
for f in sorted(set(files)):
    if f in skip:
        continue
    if migrate_file(f):
        changed += 1
        print(f'  ✓ {f}')

print(f'\n✅ Theme migration complete! {changed}/{len(files)} files updated.')
