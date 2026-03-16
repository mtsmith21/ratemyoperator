'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OperatorDashboard() {
  const [operator, setOperator] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('overview');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [tailInput, setTailInput] = useState('');
  const [tails, setTails] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return; }
      const { data: op } = await supabase.from('operators').select('*').eq('claimed_by', data.user.id).maybeSingle();
      if (!op) { window.location.href = '/'; return; }
      setOperator(op);
      setDescription(op.description || '');
      setWebsite(op.website || '');
      setTails(op.tail_numbers || []);
      const { data: reviewData } = await supabase.from('reviews').select('*').eq('operator_id', op.id).eq('is_approved', true).order('created_at', { ascending: false });
      if (reviewData) setReviews(reviewData);
      setLoading(false);
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    await supabase.from('operators').update({ description, website, tail_numbers: tails }).eq('id', operator.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function addTail() {
    const t = tailInput.trim().toUpperCase();
    if (t && !tails.includes(t)) { setTails([...tails, t]); setTailInput(''); }
  }

  function avg(field: string): number {
    if (!reviews.length) return 0;
    return reviews.reduce((s: number, r: any) => s + (r[field] as number), 0) / reviews.length;
  }

  const overallAvg = reviews.length
    ? ((avg('safety_score') + avg('service_score') + avg('punctuality_score') + avg('value_score')) / 4).toFixed(1)
    : null;

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#f0c040', fontFamily: 'sans-serif' }}>Loading dashboard...</p>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1a1d24', borderBottom: '1px solid #2a2d35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem' }}>✈</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Rate<span style={{ color: '#f0c040' }}>My</span>Operator</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{operator?.name}</span>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} style={{ background: 'transparent', border: '1px solid #2a2d35', color: '#6b7280', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>Sign Out</button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{operator?.name}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'capitalize' }}>{operator?.region} · {operator?.fleet_size} · {operator?.aircraft_count} aircraft</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2a2d35', marginBottom: '2rem' }}>
          {['overview', 'profile', 'aircraft'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.5rem', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: tab === t ? '2px solid #f0c040' : '2px solid transparent', color: tab === t ? '#f0c040' : '#6b7280', marginBottom: '-1px' }}>
              {t}
            </div>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                ['Overall', overallAvg || '—'],
                ['Safety', avg('safety_score').toFixed(1)],
                ['Service', avg('service_score').toFixed(1)],
                ['Reviews', reviews.length],
              ].map(([label, val]) => (
                <div key={label} style={{ background: '#242830', borderRadius: '10px', padding: '1.25rem', border: '1px solid #2a2d35', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f0c040' }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <div style={{ background: '#242830', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No approved reviews yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.slice(0, 5).map((r: any) => (
                  <div key={r.id} style={{ background: '#242830', borderRadius: '10px', padding: '1.25rem', border: '1px solid #2a2d35' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {[['Safety', r.safety_score], ['Service', r.service_score], ['Punctuality', r.punctuality_score], ['Value', r.value_score]].map(([l, s]) => (
                        <div key={l as string} style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{l}: <span style={{ color: '#f0c040', fontWeight: 700 }}>{s}</span></div>
                      ))}
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{r.review_text}</p>
                    <div style={{ color: '#4b5563', fontSize: '0.75rem', marginTop: '0.5rem' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{r.tail_number && ` · ${r.tail_number}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '2rem', border: '1px solid #2a2d35' }}>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Profile</h2>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Your Company</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Tell passengers about your company, fleet, and what makes you stand out..." style={{ width: '100%', padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" style={{ width: '100%', padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ background: '#f0c040', color: '#1a1d24', padding: '0.75rem 2rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Aircraft Tab */}
        {tab === 'aircraft' && (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '2rem', border: '1px solid #2a2d35' }}>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Fleet Tail Numbers</h2>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input type="text" value={tailInput} onChange={e => setTailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTail()} placeholder="e.g. N450QS" style={{ flex: 1, padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }} />
              <button onClick={addTail} style={{ background: '#f0c040', color: '#1a1d24', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
            {tails.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No tail numbers added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {tails.map(t => (
                  <div key={t} style={{ background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.85rem' }}>{t}</span>
                    <button onClick={() => setTails(tails.filter(x => x !== t))} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {tails.length > 0 && (
              <button onClick={saveProfile} disabled={saving} style={{ background: '#f0c040', color: '#1a1d24', padding: '0.75rem 2rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Tail Numbers'}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}