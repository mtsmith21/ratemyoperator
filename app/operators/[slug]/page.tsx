'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  fleet_size: string;
  region: string;
  aircraft_count: number;
}

interface Review {
  id: string;
  safety_score: number;
  service_score: number;
  punctuality_score: number;
  value_score: number;
  review_text: string;
  tail_number: string;
  date_flown: string;
  created_at: string;
}

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return <span style={{ color: '#f0c040' }}>{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</span>;
}

export default function OperatorPage({ params }: { params: { slug: string } }) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const name = decodeURIComponent(params.slug).replace(/-/g, ' ');
      const { data: op, error: opErr } = await supabase
        .from('operators')
        .select('id, name, fleet_size, region, aircraft_count')
        .ilike('name', '%' + name + '%')
        .limit(1)
        .maybeSingle();

      if (opErr || !op) {
        setError('Operator not found.');
        setLoading(false);
        return;
      }

      setOperator(op);

      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .eq('operator_id', op.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (revs) setReviews(revs);
      setLoading(false);
    }
    load();
  }, [params.slug]);

  function avg(field: keyof Review) {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + (r[field] as number), 0) / reviews.length;
  }

  const overallAvg = reviews.length
    ? ((avg('safety_score') + avg('service_score') + avg('punctuality_score') + avg('value_score')) / 4).toFixed(1)
    : null;

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#f0c040', fontFamily: 'sans-serif' }}>Loading...</p>
    </main>
  );

  if (error) return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: '1.2rem' }}>Operator not found</p>
        <a href="/" style={{ color: '#f0c040' }}>Back to operators</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1a1d24', borderBottom: '1px solid #2a2d35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>✈</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Rate<span style={{ color: '#f0c040' }}>My</span>Operator</span>
        </a>
        <a href="/review" style={{ background: '#f0c040', color: '#1a1d24', padding: '0.4rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Write a Review</a>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <a href="/" style={{ color: '#f0c040', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>← All operators</a>

        <div style={{ background: '#242830', borderRadius: '12px', padding: '2rem', margin: '1.5rem 0', border: '1px solid #2a2d35' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 800 }}>{operator?.name}</h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {operator?.fleet_size} · {operator?.region} · {operator?.aircraft_count} aircraft
              </p>
            </div>
            {overallAvg && (
              <div style={{ textAlign: 'center', background: '#1a1d24', borderRadius: '10px', padding: '1rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f0c040', lineHeight: 1 }}>{overallAvg}</div>
                <Stars score={parseFloat(overallAvg)} />
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>

          {overallAvg && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem', background: '#1a1d24', borderRadius: '8px', padding: '1rem' }}>
              {(['Safety', 'Service', 'Punctuality', 'Value'] as const).map((label, i) => {
                const fields: (keyof Review)[] = ['safety_score', 'service_score', 'punctuality_score', 'value_score'];
                const score = avg(fields[i]);
                return (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{score.toFixed(1)}</div>
                    <Stars score={score} />
                  </div>
                );
              })}
            </div>
          )}

          <a href="/review" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', padding: '0.85rem', background: '#f0c040', color: '#1a1d24', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Write a Review for {operator?.name}
          </a>
        </div>

        <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>
          {reviews.length > 0 ? `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}` : 'No Reviews Yet'}
        </h2>

        {reviews.length === 0 ? (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #2a2d35' }}>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Be the first to review {operator?.name}</p>
            <a href="/review" style={{ padding: '0.75rem 2rem', background: '#1a1d24', color: '#f0c040', border: '1px solid #f0c040', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              Write a Review
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ background: '#242830', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2d35' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {(['Safety', 'Service', 'Punctuality', 'Value'] as const).map((label, i) => {
                      const fields: (keyof Review)[] = ['safety_score', 'service_score', 'punctuality_score', 'value_score'];
                      return (
                        <div key={label}>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>{label}</div>
                          <Stars score={review[fields[i]] as number} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                    {review.date_flown && `Flew ${new Date(review.date_flown).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · `}
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    {review.tail_number && ` · ${review.tail_number}`}
                  </div>
                </div>
                <p style={{ color: '#d1d5db', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{review.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}