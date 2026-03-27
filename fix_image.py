import re

config_path = 'next.config.ts'
with open(config_path, 'r') as f:
    content = f.read()

# Add google.com to remotePatterns
new_pattern = """      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" }"""

content = re.sub(r'{\s*protocol:\s*"https",\s*hostname:\s*"cdn\.sanity\.io"\s*},[\s\S]*?{\s*protocol:\s*"https",\s*hostname:\s*"assets\.coingecko\.com"\s*}', new_pattern, content)

# If the strict pattern replacement failed, just do a more aggressive one
if 'www.google.com' not in content:
    content = content.replace('remotePatterns: [', 'remotePatterns: [\n      { protocol: "https", hostname: "**" },')

with open(config_path, 'w') as f:
    f.write(content)
