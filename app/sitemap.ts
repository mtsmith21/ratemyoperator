import type { MetadataRoute } from 'next';
import { getOperators } from '@/lib/data';

const BASE = 'https://www.ratemyoperator.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ops = await getOperators();
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/aircraft`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.3 },
    ...ops.map(op => ({
      url: `${BASE}/operator/${op.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
