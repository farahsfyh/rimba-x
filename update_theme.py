import re

files = [
    r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\computer-vision-detection-system\page.tsx",
    r"c:\Users\Acer\Downloads\rimba-x-main\app\dashboard\achievements\page.tsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Replace any hardcoded #7C3AED with #8B5CF6
    content = content.replace("#7C3AED", "#8B5CF6")
    
    # Step 2: Simplify Gradients from #7C3AED to #9333EA -> Solid #8B5CF6
    content = content.replace("bg-gradient-to-r from-[#8B5CF6] to-[#9333EA]", "bg-[#8B5CF6]")
    content = content.replace("bg-gradient-to-br from-[#8B5CF6] to-[#9333EA]", "bg-[#8B5CF6]")
    
    # Step 3: Replace any remaining indigo/violet Tailwind classes with exact #8B5CF6 theme solid tag 
    # to avoid general theme color overrides if they strictly requested "#8B5CF6"
    content = content.replace("bg-violet-600", "bg-[#8B5CF6]")
    content = content.replace("text-violet-600", "text-[#8B5CF6]")
    content = content.replace("border-violet-600", "border-[#8B5CF6]")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Simplified Theme Update Complete")
