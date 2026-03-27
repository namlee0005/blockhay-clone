import os

os.makedirs('src/app/studio/[[...index]]', exist_ok=True)

with open('src/app/studio/[[...index]]/page.tsx', 'w') as f:
    f.write("""'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity/sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
""")

with open('src/app/studio/[[...index]]/layout.tsx', 'w') as f:
    f.write("""export const metadata = {
  title: 'Blockhay Studio',
  description: 'Sanity CMS Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
""")
