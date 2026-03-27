import os
import json
import glob

# 1. Fix SiteHeader.tsx
header_path = 'src/components/SiteHeader.tsx'
if os.path.exists(header_path):
    with open(header_path, 'r') as f:
        content = f.read()
    if '"use client"' not in content and "'use client'" not in content:
        with open(header_path, 'w') as f:
            f.write('"use client";\n\n' + content)

# 2. Fix tsconfig.json
# Need to use regex to handle comments in tsconfig.json since standard json parser fails
import re
with open('tsconfig.json', 'r') as f:
    content = f.read()
if '"@sanity/*"' not in content:
    # Insert under paths
    content = re.sub(r'("@/\*"\s*:\s*\["\./src/\*"\])', r'\1,\n      "@sanity/*": ["./sanity/*"]', content)
    with open('tsconfig.json', 'w') as f:
        f.write(content)

# 3. Replace imports in all ts/tsx files
for filepath in glob.glob('src/**/*.ts*', recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = content.replace('@/../../sanity', '@sanity').replace('../../../sanity', '@sanity').replace('../../sanity', '@sanity')
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)

# 4. Fix next.config.ts
config_path = 'next.config.ts'
if os.path.exists(config_path):
    with open(config_path, 'r') as f:
        content = f.read()
    if 'allowedDevOrigins' not in content:
        new_content = content.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  allowedDevOrigins: ["192.168.1.56", "localhost"],')
        with open(config_path, 'w') as f:
            f.write(new_content)

