import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ashiato-memo.web.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/memos/create/', '/memos/*/edit'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
