import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aphrodite-nefertum.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/collection',
    '/collection/nefertum',
    '/collection/aphrodite',
    '/journal',
    '/philosophy',
    '/cart',
    '/checkout',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-policy',
    '/shipping-policy',
    '/cookie-policy',
    '/authenticity-policy',
    '/grievance-policy',
    '/intellectual-property',
    '/product-disclaimer',
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => {
    let priority = 0.5;
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly';

    if (route === '') {
      priority = 1.0;
      changeFrequency = 'daily';
    } else if (route.startsWith('/collection')) {
      priority = 0.9;
      changeFrequency = 'daily';
    } else if (route.startsWith('/journal') || route === '/philosophy') {
      priority = 0.7;
      changeFrequency = 'weekly';
    } else if (route.includes('-policy') || route.includes('terms') || route.includes('disclaimer') || route.includes('property') || route.includes('grievance')) {
      priority = 0.3;
      changeFrequency = 'monthly';
    }

    return {
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency,
      priority,
    };
  });

  // Dynamic product entries fallback
  const productSlugs = ['oudh-immortel', 'sacred-lotus', 'desert-obsidian'];
  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticEntries, ...productEntries];
}
