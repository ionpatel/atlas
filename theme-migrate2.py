#!/usr/bin/env python3
"""Second pass: catch remaining #273B3A references"""
import glob

# #273B3A was the "accent/text/dark" color in old theme
# Context-dependent replacement:
# - As text color → #FAFAFA (white) or #CDB49E (gold accent)  
# - As background → #161616 (dark surface)
# - As border → #262626
# - In gradients → gold

REPLACEMENTS = [
    # Remaining #273B3A patterns with context
    ('text-[#273B3A]', 'text-[#FAFAFA]'),
    ('bg-[#273B3A]', 'bg-[#161616]'),
    ('border-[#273B3A]', 'border-[#262626]'),
    ('hover:bg-[#273B3A]', 'hover:bg-[#1A1A1A]'),
    ('hover:text-[#273B3A]', 'hover:text-[#FAFAFA]'),
    ('from-[#273B3A]', 'from-[#CDB49E]'),
    ('to-[#273B3A]', 'to-[#B89B78]'),
    ('ring-[#273B3A]', 'ring-[#CDB49E]'),
    ('shadow-[#273B3A]', 'shadow-[#CDB49E]'),
    ('divide-[#273B3A]', 'divide-[#262626]'),
    ('placeholder-[#273B3A]', 'placeholder-[#555555]'),
    ('fill-[#273B3A]', 'fill-[#CDB49E]'),
    ('stroke-[#273B3A]', 'stroke-[#CDB49E]'),
    ("'#273B3A'", "'#CDB49E'"),
    ('"#273B3A"', '"#CDB49E"'),
    # Also catch E6D4C7 patterns
    ('text-[#E6D4C7]', 'text-[#0A0A0A]'),
    ('bg-[#E6D4C7]', 'bg-[#0A0A0A]'),
    ('border-[#E6D4C7]', 'border-[#262626]'),
    ("'#E6D4C7'", "'#0A0A0A'"),
    ('"#E6D4C7"', '"#0A0A0A"'),
    # D4CEB8 borders
    ('border-[#D4CEB8]', 'border-[#1E1E1E]'),
]

REPLACEMENTS.sort(key=lambda x: -len(x[0]))

files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

changed = 0
for fpath in sorted(set(files)):
    if 'globals.css' in fpath or 'tailwind.config' in fpath or 'theme-migrate' in fpath:
        continue
    with open(fpath, 'r') as f:
        content = f.read()
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    if content != original:
        with open(fpath, 'w') as f:
            f.write(content)
        changed += 1
        print(f'  ✓ {fpath}')

print(f'\n✅ Pass 2 complete! {changed} files updated.')
