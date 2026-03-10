'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  fleet_size: string;
  region: string;
}

const FEATURED_NAMES = [
  'Zenflight',
  'NetJets',
  'Solairus Aviation',
  'AAC Jet',
  'Jet Aviation',
  'Jet 1',
  'Elite Air',
  'Tradewind Aviation',
  'Jet Linx',
  'Thrive Aviation',
];

export default function HomePage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase
      .from('operators')
      .select('id, name, fleet_size, region')
      .order('name')
      .then(({ data }) => {
        if (data) setOperators(data);
        setLoading(false);
      });
  }, []);

  const featured = operators.filter(o =>
    FEATURED_NAMES.some(n => o.name.toLowerCase() === n.toLowerCase())
  );

  const filtered = operators.filter(o => {
    if (!search) return true;
    return o.name.toLowerCase().includes(search.toLowerCase());
  });

  const featuredFiltered = search
    ? filtered.filter(o => FEATURED_NAMES.some(n => o.name.toLowerCase() === n.toLowerCase()))
    : featured;

  const othersFiltered = search
    ? filtered.filter(o => !FEATURED_NAMES.some(n => o.name.toLowerCase() === n.toLowerCase()))
    : operators.filter(o => !FEATURED_NAMES.some(n => o.name.toLowerCase() === n.toLowerCase()));

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#1a1d24', borderBottom: '1px solid #2a2d35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✈</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
            Rate<span style={{ color: '#f0c040' }}>My</span>Operator
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/review" style={{ color: '#f0c040', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Write a Review</a>
          {user ? (
            <a href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Admin</a>
          ) : (
            <a href="/login" style={{ background: '#f0c040', color: '#1a1d24', padding: '0.4rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Sign in</a>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1d24 0%, #242830 100%)', padding: '3rem 2rem', textAlign: 'center', borderBottom: '2px solid #f0c040' }}>
        <h1 style={{ color: '#fff', fontSize: '2.2rem', margin: '0 0 0.5rem', fontWeight: 800 }}>
          Private Jet <span style={{ color: '#f0c040' }}>Operator Reviews</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: '0 0 2rem' }}>
          Honest reviews from real passengers. Find the best operators before you fly.
        </p>
        <div style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search all operators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.9rem 1.25rem 0.9rem 3rem', borderRadius: '8px', border: '2px solid #f0c040', background: '#fff', fontSize: '1rem', color: '#1a1d24', boxSizing: 'border-box', outline: 'none' }}
          />
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
        </div>
        {!loading && (
          <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            {operators.length} operators listed
          </p>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#f0c040' }}>Loading operators...</div>
        ) : (
          <>
            {/* Featured Top 10 */}
            {!search && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{ background: '#f0c040', color: '#1a1d24', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</span>
                  <h2 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Top 10 Operators</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {featuredFiltered.map((op, i) => (
                    <OperatorCard key={op.id} op={op} rank={i + 1} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Search results or full alphabetical list */}
            <div>
              {!search && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>All Operators</h2>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>A–Z</span>
                </div>
              )}
              {search && (
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong style={{ color: '#fff' }}>{search}</strong>"
                </p>
              )}

              {search ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {filtered.map(op => (
                    <OperatorCard key={op.id} op={op} featured={FEATURED_NAMES.some(n => n.toLowerCase() === op.name.toLowerCase())} />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      No operators found for "{search}"
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {othersFiltered.map(op => (
                    <OperatorCard key={op.id} op={op} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2a2d35', padding: '2rem', textAlign: 'center', color: '#4b5563', fontSize: '0.82rem', marginTop: '2rem' }}>
        <p style={{ margin: 0 }}>© 2025 RateMyOperator · <a href="/review" style={{ color: '#f0c040', textDecoration: 'none' }}>Write a Review</a> · <a href="/login" style={{ color: '#f0c040', textDecoration: 'none' }}>Sign in</a></p>
      </footer>
    </main>
  );
}

function OperatorCard({ op, rank, featured }: { op: Operator; rank?: number; featured?: boolean }) {
  return (
    <div style={{
      background: featured ? 'linear-gradient(135deg, #242830, #2a2d35)' : '#242830',
      border: `1px solid ${featured ? '#f0c040' : '#2a2d35'}`,
      borderRadius: '10px',
      padding: '1.1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'border-color 0.15s',
      cursor: 'default',
    }}>
      {rank ? (
        <div style={{ width: '2rem', height: '2rem', background: '#f0c040', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#1a1d24', flexShrink: 0 }}>
          {rank}
        </div>
      ) : (
        <div style={{ width: '2rem', height: '2rem', background: '#1a1d24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
          ✈
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.name}</div>
        <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.15rem', textTransform: 'capitalize' }}>
          {op.fleet_size}{op.region ? ` · ${op.region}` : ''}
        </div>
      </div>
      <a href={`/review`} style={{ background: '#1a1d24', color: '#f0c040', border: '1px solid #f0c040', borderRadius: '5px', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Review
      </a>
    </div>
  );
}
