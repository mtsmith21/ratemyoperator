import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/login', '/auth/', '/api/', '/claim', '/review'],
      },
    ],
    sitemap: 'https://www.ratemyoperator.com/sitemap.xml',
  };
}
