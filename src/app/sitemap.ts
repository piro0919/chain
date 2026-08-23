import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://chain.kkweb.io";

/**
 * next-sitemap は動的セグメントを列挙できず、[locale] しかないこのサイトでは
 * 何も書き出せていなかった。ロケールは routing が持っているので自前で並べる。
 */
// 既定の言語は接頭辞なし。localePrefix: "as-needed" に合わせる
function href(locale: string, path = ""): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  return `${SITE_URL}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    alternates: {
      languages: {
        ...Object.fromEntries(routing.locales.map((one) => [one, href(one)])),
        // 言語を選べない利用者にどれを見せるかを決めておく
        "x-default": href(routing.defaultLocale),
      },
    },
    changeFrequency: "monthly" as const,
    lastModified: new Date(),
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    url: href(locale),
  }));
}
