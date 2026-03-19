files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\analyse\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\profile\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step: Update forces to light lilac / violet-100
    content = content.replace('!text-white', '!text-violet-100')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Title Updated to Lilac")
