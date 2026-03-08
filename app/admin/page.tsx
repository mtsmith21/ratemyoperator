'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  operator_id: string;
  reviewer_name: string;
  safety_score: number;
  service_score: number;
  punctuality_score: number;
  value_score: number;
  review_text: string;
  tail_number: string;
  date_flown: string;
  is_approved: boolean;
  is_verified: boolean;
  created_at: string;
  operators: { name: string };
}

const ADMIN_EMAIL = 'mtsmith21@gmail.com';

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        window.location.href = '/';
      } else {
        setUser(data.user);
        loadReviews();
      }
    });
  }, []);

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, operators(name)')
      .order('created_at', { ascending: false });
    if (data) setReviews(data as any);
    setLoading(false);
  }

  async function approve(id: string) {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
  }

  async function reject(id: string) {
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  const pending = reviews.filter(r => !r.is_approved).length;

  function stars(n: number) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function avg(r: Review) {
    return ((r.safety_score + r.service_score + r.punctuality_score + r.value_score) / 4).toFixed(1);
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#f0c040', fontFamily: 'sans-serif' }}>Loading...</p>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>
              ✈ <span style={{ color: '#f0c040' }}>Admin</span> — Review Moderation
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>ratemyoperator.com</p>
          </div>
          {pending > 0 && (
            <div style={{ background: '#f0c040', color: '#1a1d24', borderRadius: '999px', padding: '0.4rem 1rem', fontWeight: 700, fontSize: '0.9rem' }}>
              {pending} pending
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['pending', 'approved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? '#f0c040' : '#242830', color: filter === f ? '#1a1d24' : '#9ca3af' }}
            >{f} {f === 'pending' ? `(${pending})` : f === 'approved' ? `(${reviews.filter(r => r.is_approved).length})` : `(${reviews.length})`}</button>
          ))}
        </div>

        {/* Reviews */}
        {filtered.length === 0 ? (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              {filter === 'pending' ? '🎉 No pending reviews — you\'re all caught up!' : 'No reviews found.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(review => (
              <div key={review.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', borderLeft: `4px solid ${review.is_approved ? '#3ecf8e' : '#f0c040'}` }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1d24' }}>{review.operators?.name}</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {review.date_flown && ` · Flew: ${new Date(review.date_flown).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                      {review.tail_number && ` · Tail: ${review.tail_number}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1d24' }}>{avg(review)}</span>
                    <span style={{ color: '#f0c040', fontSize: '1rem' }}>{stars(Math.round(parseFloat(avg(review))))}</span>
                  </div>
                </div>

                {/* Scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem', background: '#f4f1eb', borderRadius: '8px', padding: '0.75rem' }}>
                  {[['Safety', review.safety_score], ['Service', review.service_score], ['Punctuality', review.punctuality_score], ['Value', review.value_score]].map(([label, score]) => (
                    <div key={label as string} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ color: '#f0c040', fontSize: '0.9rem' }}>{stars(score as number)}</div>
                    </div>
                  ))}
                </div>

                {/* Review text */}
                <p style={{ margin: '0 0 1rem', color: '#374151', lineHeight: 1.6, fontSize: '0.95rem' }}>{review.review_text}</p>

                {/* Actions */}
                {!review.is_approved ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => approve(review.id)}
                      style={{ flex: 1, padding: '0.65rem', background: '#1a1d24', color: '#f0c040', border: 'none', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >✓ Approve</button>
                    <button
                      onClick={() => reject(review.id)}
                      style={{ flex: 1, padding: '0.65rem', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fca5a5', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >✕ Reject</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#3ecf8e', fontWeight: 600, fontSize: '0.88rem' }}>✓ Published</span>
                    <button
                      onClick={() => reject(review.id)}
                      style={{ padding: '0.4rem 1rem', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fca5a5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
