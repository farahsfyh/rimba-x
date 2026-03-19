files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\analyse\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\profile\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\dashboard\achievements\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply bold black fonts forcing to Banner Primary Title Headers to mirror Home Banner styles
    content = content.replace('!text-violet-100', '!text-[#0f172a]')
    content = content.replace('text-white', '!text-[#0f172a]')
    
    # Subheadings updates where relevant for descriptions:
    content = content.replace('text-teal-100', 'text-[#0f172a]/80')
    content = content.replace('text-violet-100', 'text-[#0f172a]/80')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Headers Standardised with Black Fonts")
