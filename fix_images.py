import re

config_path = 'next.config.ts'
with open(config_path, 'r') as f:
    content = f.read()

# A very broad remotePattern replacing the entire images section
new_images = """images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ],
  },"""

content = re.sub(r'images:\s*{[\s\S]*?},', new_images, content)

# Check if the CSP header might be blocking images
new_csp = """const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://placeholder-ad-network.example.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src * data: blob:",
  "connect-src 'self' https://api.coingecko.com",
  "frame-ancestors 'none'",
].join("; ");"""

content = re.sub(r'const CSP = \[[\s\S]*?\]\.join\("; "\);', new_csp, content)

with open(config_path, 'w') as f:
    f.write(content)
