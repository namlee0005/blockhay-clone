import re

header_path = 'src/components/SiteHeader.tsx'
with open(header_path, 'r') as f:
    content = f.read()

# Replace old Sanity Vietnamese categories with new English categories
new_nav = """const NAV_LINKS = [
  { href: "/news", label: "News" },
  { href: "/markets", label: "Markets" },
  { href: "/web3-defi", label: "Web3 & DeFi" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/reviews", label: "Reviews" },
  { href: "/bang-gia", label: "Prices" },
];"""

content = re.sub(r'const NAV_LINKS = \[[\s\S]*?\];', new_nav, content)

with open(header_path, 'w') as f:
    f.write(content)
