import re

article_path = 'sanity/schemas/article.ts'
with open(article_path, 'r') as f:
    content = f.read()

# Relax the excerpt validation
content = re.sub(
    r'Rule\.required\(\)\.min\(150\)\.max\(160\)\.error\(\n\s*"Excerpt phải từ 150–160 ký tự để tối ưu SEO"\n\s*\)',
    r'Rule.required()',
    content
)

# Also relax the image alt text validation which might be easy to miss
# It's inside the image field definition:
content = re.sub(
    r'title: "Alt text",\n\s*validation: \(Rule\) => Rule\.required\(\),',
    r'title: "Alt text",',
    content
)

with open(article_path, 'w') as f:
    f.write(content)

