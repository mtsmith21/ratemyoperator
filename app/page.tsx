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

export default function HomePage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('operators')
      .select('id, name, fleet_size, region, aircraft_count')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setOperators(data);
        setLoading(false);
      });
  }, []);

  const filtered = operators.filter(op =>
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    op.region?.toLowerCase().includes(search.toLowerCase())
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

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Private Aviation Operators
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Find and review private jet operators worldwide.
        </p>

        <input
          type="text"
          placeholder="Search operators or regions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #2a2d35', background: '#242830', color: '#fff', fontSize: '0.95rem', marginBottom: '1.5rem', boxSizing: 'border-box' }}
        />

        {loading ? (
          <p style={{ color: '#f0c040', textAlign: 'center' }}>Loading operators...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>No operators found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(op => (
              
                key={op.id}
                href={`/operators/${op.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#242830', borderRadius: '10px', padding: '1.25rem 1.5rem', border: '1px solid #2a2d35', textDecoration: 'none' }}
              >
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{op.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.83rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                    {op.region} · {op.fleet_size} · {op.aircraft_count} aircraft
                  </div>
                </div>
                <span style={{ color: '#f0c040', fontSize: '1.2rem' }}>›</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}