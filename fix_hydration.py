import re

layout_path = 'src/app/layout.tsx'
with open(layout_path, 'r') as f:
    content = f.read()

# Hydration mismatch is caused by browser extensions injecting attributes into <html> or <body>
# The fix is to add suppressHydrationWarning to both tags
if 'suppressHydrationWarning' not in content:
    content = re.sub(r'<html([^>]*)>', r'<html\1 suppressHydrationWarning>', content)
    content = re.sub(r'<body([^>]*)>', r'<body\1 suppressHydrationWarning>', content)
    
    with open(layout_path, 'w') as f:
        f.write(content)
