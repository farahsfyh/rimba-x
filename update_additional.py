files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\dashboard\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\analyse\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Clean Up continuous gradient layouts to flattened headers
    content = content.replace("bg-gradient-to-br from-indigo-500 to-violet-500", "bg-[#8B5CF6]")
    content = content.replace("bg-gradient-to-r from-blue-600 to-indigo-700", "bg-[#8B5CF6]")
    content = content.replace("gradient-xp-bar", "bg-[#8B5CF6]") # XP Progress fix

    # Step 2: Swap explicit classes for standard theme declarations
    content = content.replace("bg-violet-600", "bg-[#8B5CF6]")
    content = content.replace("text-indigo-700", "text-[#8B5CF6]")
    content = content.replace("text-indigo-600", "text-[#8B5CF6]")
    content = content.replace("text-indigo-500", "text-[#8B5CF6]")
    content = content.replace("bg-indigo-600", "bg-[#8B5CF6]")
    content = content.replace("bg-indigo-50", "bg-violet-50")
    content = content.replace("text-indigo-600", "text-[#8B5CF6]")
    content = content.replace("border-indigo-600", "border-[#8B5CF6]")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Additional Features Updated")
