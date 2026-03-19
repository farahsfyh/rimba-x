files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\analyse\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\profile\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace class="... text-white ..." with class="... !text-white ..." to bypass global style sheet overrides
    content = content.replace('className="text-3xl md:text-4xl font-extrabold text-white', 'className="text-3xl md:text-4xl font-extrabold !text-white')
    content = content.replace('className="text-3xl md:text-4xl font-bold text-white', 'className="text-3xl md:text-4xl font-bold !text-white')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Title Contrast Fixed")
