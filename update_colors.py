import re

filepath = r"c:\Users\Acer\Downloads\rimba-x-main\app\(dashboard)\career\modules\computer-vision-detection-system\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Indigo with Violet
content = content.replace("indigo-", "violet-")
content = content.replace("indigo ", "violet ")

# Replace common Blue highlights with Violet (to avoid "random color per module")
content = content.replace("bg-blue-50", "bg-violet-50")
content = content.replace("bg-blue-100", "bg-violet-100")
content = content.replace("text-blue-600", "text-violet-600")
content = content.replace("hover:border-blue-200", "hover:border-violet-200")
content = content.replace("hover:bg-blue-50/30", "hover:bg-violet-50/30")
content = content.replace("from-indigo-900", "from-violet-900")
content = content.replace("to-blue-900", "to-purple-900")
content = content.replace("text-blue-200", "text-violet-200")
content = content.replace("text-blue-900", "text-violet-900")
content = content.replace("bg-blue-600", "bg-violet-600")

# Replace Purple with Violet where useful for highlighting
content = content.replace("bg-purple-600", "bg-violet-600")
content = content.replace("text-purple-600", "text-violet-600")
content = content.replace("border-purple-600", "border-violet-600")
content = content.replace("bg-purple-50", "bg-violet-50")
content = content.replace("purple-200", "violet-200")
content = content.replace("purple-100", "violet-100")
content = content.replace("purple-500", "violet-500")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement Complete")
