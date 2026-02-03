import { MetadataRoute } from 'next';
import { routing } from '@/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ashiato-memo.web.app';
  const locales = routing.locales;

  const staticPages = ['', '/memos', '/analysis', '/settings', '/settings/about'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      const url = locale === routing.defaultLocale
        ? `${baseUrl}${page}`
        : `${baseUrl}/${locale}${page}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'daily',
        priority: page === '' ? 1.0 : page === '/memos' ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              l === routing.defaultLocale
                ? `${baseUrl}${page}`
                : `${baseUrl}/${l}${page}`,
            ])
          ),
        },
      });
    }
  }

  return sitemapEntries;
}
