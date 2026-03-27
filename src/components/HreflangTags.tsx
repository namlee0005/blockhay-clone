// Server Component — emits hreflang link tags for every page
const BASE = "https://blockhay.com";

interface Props {
  /** Pathname WITHOUT locale prefix, e.g. "/tin-tuc/my-slug" */
  pathname: string;
}

export default function HreflangTags({ pathname }: Props) {
  const viUrl = `${BASE}${pathname}`;
  const enUrl = `${BASE}/en${pathname}`;

  return (
    <>
      <link rel="alternate" hrefLang="vi" href={viUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {/* x-default always resolves to the Vietnamese URL */}
      <link rel="alternate" hrefLang="x-default" href={viUrl} />
    </>
  );
}
