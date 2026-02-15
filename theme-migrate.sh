#!/bin/bash
# Atlas Theme Migration: Warm Earth → Dark Luxury
# Replaces all old color references with new dark theme

cd /home/harshil/atlas

# Find all relevant files
FILES=$(find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -name "globals.css" ! -name "tailwind.config.ts")

for f in $FILES; do
  # === BACKGROUNDS ===
  # Main background: beige → deep black
  sed -i 's/bg-\[#E6D4C7\]/bg-[#0A0A0A]/g' "$f"
  sed -i 's/bg-\[#F5F2E8\]/bg-[#111111]/g' "$f"
  sed -i 's/bg-\[#E8E3CC\]/bg-[#111111]/g' "$f"
  sed -i 's/bg-\[#DDD7C0\]/bg-[#161616]/g' "$f"
  sed -i 's/bg-\[#D4CDB8\]/bg-[#1A1A1A]/g' "$f"
  sed -i 's/bg-\[#D4CEB8\]/bg-[#1A1A1A]/g' "$f"
  sed -i 's/bg-\[#C5BDA8\]/bg-[#1A1A1A]/g' "$f"
  
  # Cinnamon accent → Gold accent
  sed -i 's/bg-\[#9C4A29\]/bg-[#CDB49E]/g' "$f"
  sed -i 's/bg-\[#B85A35\]/bg-[#E8D5B7]/g' "$f"
  sed -i 's/bg-\[#7D3B21\]/bg-[#B89B78]/g' "$f"
  sed -i 's/bg-\[#273B3A\]/bg-[#161616]/g' "$f"
  sed -i 's/bg-\[#2D1810\]/bg-[#111111]/g' "$f"
  sed -i 's/bg-\[#3D2820\]/bg-[#1A1A1A]/g' "$f"
  
  # === TEXT COLORS ===
  # Dark text → light text
  sed -i 's/text-\[#273B3A\]/text-[#FAFAFA]/g' "$f"
  sed -i 's/text-\[#2D1810\]/text-[#FAFAFA]/g' "$f"
  sed -i 's/text-\[#6B5B4F\]/text-[#999999]/g' "$f"
  sed -i 's/text-\[#1A0E09\]/text-[#FAFAFA]/g' "$f"
  
  # Accent text: cinnamon → gold
  sed -i 's/text-\[#9C4A29\]/text-[#CDB49E]/g' "$f"
  sed -i 's/text-\[#B85A35\]/text-[#E8D5B7]/g' "$f"
  sed -i 's/text-\[#7D3B21\]/text-[#B89B78]/g' "$f"
  
  # Cream text → dark text (for contrast on gold bg)
  sed -i 's/text-\[#E6D4C7\]/text-[#0A0A0A]/g' "$f"
  sed -i 's/text-\[#F5F2E8\]/text-[#0A0A0A]/g' "$f"
  sed -i 's/text-\[#E8E3CC\]/text-[#FAFAFA]/g' "$f"
  
  # === BORDERS ===
  sed -i 's/border-\[#E6D4C7\]/border-[#262626]/g' "$f"
  sed -i 's/border-\[#D4CDB8\]/border-[#1E1E1E]/g' "$f"
  sed -i 's/border-\[#D4CEB8\]/border-[#1E1E1E]/g' "$f"
  sed -i 's/border-\[#DDD7C0\]/border-[#262626]/g' "$f"
  sed -i 's/border-\[#F5F2E8\]/border-[#1E1E1E]/g' "$f"
  sed -i 's/border-\[#9C4A29\]/border-[#CDB49E]/g' "$f"
  sed -i 's/border-\[#273B3A\]/border-[#262626]/g' "$f"
  sed -i 's/border-\[#B85A35\]/border-[#CDB49E]/g' "$f"
  
  # === UTILITY CLASSES ===
  sed -i 's/bg-cream-light/bg-[#111111]/g' "$f"
  sed -i 's/bg-cream-dark/bg-[#161616]/g' "$f"
  sed -i 's/bg-cream/bg-[#0A0A0A]/g' "$f"
  sed -i 's/bg-cinnamon-light/bg-[#E8D5B7]/g' "$f"
  sed -i 's/bg-cinnamon-dark/bg-[#B89B78]/g' "$f"
  sed -i 's/bg-cinnamon/bg-[#CDB49E]/g' "$f"
  
  sed -i 's/text-earth-muted/text-[#888888]/g' "$f"
  sed -i 's/text-earth-light/text-[#999999]/g' "$f"
  sed -i 's/text-earth/text-[#FAFAFA]/g' "$f"
  sed -i 's/text-cream/text-[#0A0A0A]/g' "$f"
  sed -i 's/text-cinnamon/text-[#CDB49E]/g' "$f"
  
  sed -i 's/border-cream/border-[#262626]/g' "$f"
  sed -i 's/border-cinnamon/border-[#CDB49E]/g' "$f"
  
  sed -i 's/shadow-warm-lg/shadow-dark-lg/g' "$f"
  sed -i 's/shadow-warm/shadow-dark/g' "$f"
  sed -i 's/shadow-cinnamon/shadow-gold/g' "$f"
  
  sed -i 's/glass-cream/glass-dark/g' "$f"
  sed -i 's/card-cream/card-dark/g' "$f"
  
  # === RAW HEX IN STYLE OBJECTS ===
  # background, backgroundColor, borderColor, color in inline styles
  sed -i "s/backgroundColor: ['\"]#E6D4C7['\"]/backgroundColor: '#0A0A0A'/g" "$f"
  sed -i "s/backgroundColor: ['\"]#F5F2E8['\"]/backgroundColor: '#111111'/g" "$f"
  sed -i "s/backgroundColor: ['\"]#273B3A['\"]/backgroundColor: '#161616'/g" "$f"
  sed -i "s/backgroundColor: ['\"]#9C4A29['\"]/backgroundColor: '#CDB49E'/g" "$f"
  sed -i "s/background: ['\"]#E6D4C7['\"]/background: '#0A0A0A'/g" "$f"
  sed -i "s/background: ['\"]#273B3A['\"]/background: '#161616'/g" "$f"
  sed -i "s/color: ['\"]#273B3A['\"]/color: '#FAFAFA'/g" "$f"
  sed -i "s/color: ['\"]#E6D4C7['\"]/color: '#0A0A0A'/g" "$f"
  sed -i "s/color: ['\"]#9C4A29['\"]/color: '#CDB49E'/g" "$f"
  sed -i "s/color: ['\"]#2D1810['\"]/color: '#FAFAFA'/g" "$f"
  sed -i "s/borderColor: ['\"]#D4CDB8['\"]/borderColor: '#262626'/g" "$f"
  sed -i "s/borderColor: ['\"]#E6D4C7['\"]/borderColor: '#262626'/g" "$f"
  
  # === GRADIENT REFERENCES ===
  sed -i 's/from-\[#273B3A\]/from-[#CDB49E]/g' "$f"
  sed -i 's/to-\[#273B3A\]/to-[#B89B78]/g' "$f"
  sed -i 's/from-\[#9C4A29\]/from-[#CDB49E]/g' "$f"
  sed -i 's/to-\[#9C4A29\]/to-[#B89B78]/g' "$f"
  sed -i 's/from-\[#B85A35\]/from-[#E8D5B7]/g' "$f"
  sed -i 's/to-\[#B85A35\]/to-[#CDB49E]/g' "$f"
  sed -i 's/from-\[#7D3B21\]/from-[#B89B78]/g' "$f"
  sed -i 's/to-\[#7D3B21\]/to-[#9A8670]/g' "$f"
  
  # === RING / FOCUS ===
  sed -i 's/ring-\[#9C4A29\]/ring-[#CDB49E]/g' "$f"
  sed -i 's/ring-\[#273B3A\]/ring-[#CDB49E]/g' "$f"
  sed -i 's/focus:ring-\[#273B3A\]/focus:ring-[#CDB49E]/g' "$f"
  
  # === SHADOW RGBA ===
  sed -i 's/rgba(156, 74, 41/rgba(205, 180, 158/g' "$f"
  sed -i 's/rgba(45, 24, 16/rgba(0, 0, 0/g' "$f"
  
  # === HOVER STATES ===
  sed -i 's/hover:bg-\[#E6D4C7\]/hover:bg-[#1A1A1A]/g' "$f"
  sed -i 's/hover:bg-\[#F5F2E8\]/hover:bg-[#1A1A1A]/g' "$f"
  sed -i 's/hover:bg-\[#DDD7C0\]/hover:bg-[#262626]/g' "$f"
  sed -i 's/hover:bg-\[#9C4A29\]/hover:bg-[#E8D5B7]/g' "$f"
  sed -i 's/hover:bg-\[#273B3A\]/hover:bg-[#1A1A1A]/g' "$f"
  sed -i 's/hover:bg-\[#3D2820\]/hover:bg-[#262626]/g' "$f"
  sed -i 's/hover:text-\[#273B3A\]/hover:text-[#FAFAFA]/g' "$f"
  sed -i 's/hover:text-\[#9C4A29\]/hover:text-[#CDB49E]/g' "$f"
  sed -i 's/hover:border-\[#9C4A29\]/hover:border-[#CDB49E]/g' "$f"
  
  # === PULSE / ANIMATE ===
  sed -i 's/animate-pulse-cinnamon/animate-pulse-gold/g' "$f"
  
done

echo "✅ Theme migration complete! $(echo "$FILES" | wc -l) files processed."
