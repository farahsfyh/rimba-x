import re

files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\analyse\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\profile\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\dashboard\achievements\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Replace solid #8B5CF6 backdrop with gradient-hero rule
    content = content.replace('bg-[#8B5CF6]', 'gradient-hero')
    content = content.replace('bg-slate-700', 'gradient-hero') # Backup
    content = content.replace('bg-violet-600', 'gradient-hero') # Backup

    # Step 2: Set titles font explicitly over with Force White overrides
    content = content.replace('!text-[#0f172a]', '!text-white')
    content = content.replace('!text-[#0F172A]', '!text-white') # Duplicate safety

    # Step 3: Set descriptions font with force Soft White
    content = content.replace('text-[#0f172a]/80', 'text-white/80')
    content = content.replace('text-[#0F172A]/80', 'text-white/80') # Duplicate safety

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Headers Standardised with Gradient & White Fonts")
