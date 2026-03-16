'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  fleet_size: string;
  region: string;
  aircraft_count: number;
  avg_rating?: number;
  review_count?: number;
}

export default function HomePage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: ops } = await supabase.from('operators').select('id, name, fleet_size, region, aircraft_count').order('name', { ascending: true });
      if (!ops) { setLoading(false); return; }
      const { data: reviews } = await supabase.from('reviews').select('operator_id, safety_score, service_score, punctuality_score, value_score').eq('is_approved', true);
      const enriched = ops.map(op => {
        const r = reviews?.filter(r => r.operator_id === op.id) || [];
        const avg = r.length > 0 ? r.reduce((s, x) => s + (x.safety_score + x.service_score + x.punctuality_score + x.value_score) / 4, 0) / r.length : 0;
        return { ...op, avg_rating: parseFloat(avg.toFixed(1)), review_count: r.length };
      });
      setOperators(enriched);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = operators.filter(op => op.name.toLowerCase().includes(search.toLowerCase()) || op.region?.toLowerCase().includes(search.toLowerCase()));
  const topRated = [...operators].filter(op => (op.review_count || 0) > 0).sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 6);

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1a1d24', borderBottom: '1px solid #2a2d35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem' }}>✈</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Rate<span style={{ color: '#f0c040' }}>My</span>Operator</span>
        </a>
        <a href="/review" style={{ background: '#f0c040', color: '#1a1d24', padding: '0.5rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Write a Review</a>
      </header>
      <div style={{ background: 'linear-gradient(180deg, #1e2128 0%, #1a1d24 100%)', borderBottom: '1px solid #2a2d35', padding: '4rem 2rem 3rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#f0c04020', border: '1px solid #f0c04040', borderRadius: '20px', padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#f0c040', fontSize: '0.8rem', fontWeight: 600 }}>{loading ? '...' : operators.length.toLocaleString()} operators listed</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1 }}>Find the Best<br /><span style={{ color: '#f0c040' }}>Private Jet Operators</span></h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem', margin: '0 0 2rem' }}>Real reviews from real passengers. Research operators before you fly.</p>
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>🔍</span>
            <input type="text" placeholder="Search operators, regions..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '10px', border: '1px solid #2a2d35', background: '#242830', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {!search && topRated.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ background: '#f0c040', color: '#1a1d24', fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>TOP RATED</span>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Highest Rated Operators</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {topRated.map((op, i) => (
                <a key={op.id} href={`/operators/${op.id}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #242830 0%, #1e2128 100%)', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f0c04040', textDecoration: 'none', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#f0c040', color: '#1a1d24', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{i + 1}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', paddingRight: '2rem' }}>{op.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'capitalize', marginBottom: '0.75rem' }}>{op.region} · {op.fleet_size} · {op.aircraft_count} aircraft</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: '#f0c040', fontWeight: 800, fontSize: '1.1rem' }}>{op.avg_rating?.toFixed(1)}</span>
                        <span style={{ color: '#f0c040', fontSize: '0.8rem' }}>{'★'.repeat(Math.round(op.avg_rating || 0))}{'☆'.repeat(5 - Math.round(op.avg_rating || 0))}</span>
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>{op.review_count} review{op.review_count !== 1 ? 's' : ''}</div>
                    </div>
                    <span style={{ background: '#f0c040', color: '#1a1d24', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Review →</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{search ? `Results for "${search}"` : 'All Operators'} <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.85rem' }}>A–Z</span></h2>
            <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>{filtered.length} operators</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#f0c040' }}>Loading operators...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>No operators found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filtered.map(op => (
                <a key={op.id} href={`/operators/${op.id}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#242830', borderRadius: '12px', padding: '1.25rem', border: '1px solid #2a2d35', textDecoration: 'none' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{op.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'capitalize', marginBottom: '0.75rem' }}>{op.region} · {op.fleet_size} · {op.aircraft_count} aircraft</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {(op.review_count || 0) > 0 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: '#f0c040', fontWeight: 800 }}>{op.avg_rating?.toFixed(1)}</span>
                          <span style={{ color: '#f0c040', fontSize: '0.8rem' }}>{'★'.repeat(Math.round(op.avg_rating || 0))}{'☆'.repeat(5 - Math.round(op.avg_rating || 0))}</span>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>{op.review_count} review{op.review_count !== 1 ? 's' : ''}</div>
                      </div>
                    ) : (
                      <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>No reviews yet</div>
                    )}
                    <span style={{ background: '#f0c040', color: '#1a1d24', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Review →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
