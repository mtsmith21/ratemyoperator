import { getOperators, getApprovedReviews } from '@/lib/data';
import { operatorTag } from '@/lib/operatorTags';
import HomeClient, { type Operator, type Review } from './HomeClient';

// Server-rendered so the operator count and directory are in the HTML (and visible to Google).
// Refreshed every minute so newly approved reviews show up quickly.
export const revalidate = 60;

export default async function HomePage() {
  const [ops, reviewData] = await Promise.all([getOperators(), getApprovedReviews()]);

  const operators: Operator[] = ops.map(op => {
    const opReviews = reviewData.filter(r => r.operator_id === op.id);
    const count = opReviews.length;
    const avg = count > 0
      ? opReviews.reduce((s, r) => s + (r.safety_score + r.service_score + r.punctuality_score + r.value_score) / 4, 0) / count
      : 0;
    return {
      id: op.id,
      name: op.name,
      slug: op.slug,
      tag: operatorTag(op.name),
      fleet_size: op.fleet_size || '',
      region: op.region || '',
      aircraft_count: op.aircraft_count || 0,
      avg_rating: parseFloat(avg.toFixed(1)),
      review_count: count,
    };
  });

  const reviews: Review[] = reviewData.slice(0, 5).map(r => ({
    id: r.id,
    operator_id: r.operator_id,
    safety_score: r.safety_score,
    service_score: r.service_score,
    punctuality_score: r.punctuality_score,
    value_score: r.value_score,
    review_text: r.review_text,
    created_at: r.created_at,
    operators: { name: ops.find(o => o.id === r.operator_id)?.name || 'Unknown' },
  }));

  return <HomeClient initialOperators={operators} initialReviews={reviews} />;
}
