import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  // vi has no URL prefix; en is /en/
  localePrefix: "as-needed",
});
