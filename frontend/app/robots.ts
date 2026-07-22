import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aphrodite-nefertum.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/account', '/account/*', '/checkout', '/api/*'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
