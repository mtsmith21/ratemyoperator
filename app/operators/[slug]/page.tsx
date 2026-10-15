import { notFound, permanentRedirect } from 'next/navigation';
import { getOperators } from '@/lib/data';

// Old operator URLs used the database id (/operators/<uuid>).
// They now redirect permanently to the server-rendered /operator/<slug> page.
export const dynamic = 'force-dynamic';

export default async function LegacyOperatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = decodeURIComponent(slug);
  const ops = await getOperators();
  const op = ops.find(o => o.id === key || o.slug === key);
  if (!op) notFound();
  permanentRedirect(`/operator/${op.slug}`);
}
