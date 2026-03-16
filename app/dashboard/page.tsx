'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OperatorDashboard() {
  const [operator, setOperator] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [tailInput, setTailInput] = useState('');
  const [tails, setTails] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return; }
      setUser(data.user);
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

  function removeTail(t: string) { setTails(tails.filter(x => x !== t)); }

  function avg(field: string) {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r[field], 0) / reviews.length).toFixed(1);
  }

  const overallAvg = reviews.length
    ? ((parseFloat(avg('safety_score')) + parseFloat(avg('service_score')) + parseFloat(avg('punctuality_score')) + parseFloat(avg('value_score'))) / 4).toFixed(1)
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
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user?.email}</span>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} style={{ background: 'none', border: '1px solid #2a2d35', color: '#6b7280', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>Sign out</button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{operator?.name}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', textTransform: 'capitalize' }}>{operator?.region} · {operator?.fleet_size} · {operator?.aircraft_count} aircraft</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[['Overall', overallAvg || '—'], ['Safety', avg('safety_score')], ['Service', avg('service_score')], ['Reviews', reviews.length]].map(([label, val]) => (
            <div key={label} style={{ background: '#242830', borderRadius: '10px', padding: '1.25rem', border: '1px solid #2a2d35', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f0c040', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2d35', marginBottom: '2rem' }}>
          {['overview', 'profile', 'fleet'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #f0c040' : '2px solid transparent', color: tab === t ? '#f0c040' : '#6b7280', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '-1px' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>{reviews.length > 0 ? `${reviews.length} Reviews` : 'No Reviews Yet'}</h2>
            {reviews.length === 0 ? (
              <div style={{ background: '#242830', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #2a2d35' }}>
                <p style={{ color: '#6b7280' }}>No approved reviews yet. Share your profile to get more reviews!</p>
                <a href={`/operators/${operator?.id}`} style={{ display: 'inline-block', marginTop: '1rem', color: '#f0c040', textDecoration: 'none', fontWeight: 600 }}>View your public profile →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: '#242830', borderRadius: '10px', padding: '1.25rem', border: '1px solid #2a2d35' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {[['Safety', r.safety_score], ['Service', r.service_score], ['Punctuality', r.punctuality_score], ['Value', r.value_score]].map(([l, s]) => (
                          <div key={l as string}>
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase' }}>{l}</div>
                            <div style={{ color: '#f0c040', fontWeight: 700 }}>{s}/5</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{r.review_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '2rem', border: '1px solid #2a2d35' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Your Company</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe your operation, history, and what makes you stand out..." style={{ width: '100%', padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" style={{ width: '100%', padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            {saved && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px', fontSize: '0.88rem', color: '#065f46' }}>✅ Profile saved successfully!</div>}
            <button onClick={saveProfile} disabled={saving} style={{ padding: '0.85rem 2rem', background: '#f0c040', color: '#1a1d24', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Fleet Tab */}
        {tab === 'fleet' && (
          <div style={{ background: '#242830', borderRadius: '12px', padding: '2rem', border: '1px solid #2a2d35' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.25rem' }}>Aircraft Tail Numbers</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input type="text" value={tailInput} onChange={e => setTailInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && addTail()} placeholder="e.g. N450QS" style={{ flex: 1, padding: '0.75rem 1rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', boxSizing: 'border-box' }} />
              <button onClick={addTail} style={{ padding: '0.75rem 1.5rem', background: '#f0c040', color: '#1a1d24', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
            {tails.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>No tail numbers added yet. Add your aircraft registration numbers above.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {tails.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '6px', padding: '0.4rem 0.85rem', fontFamily: 'monospace', color: '#f0c040', fontSize: '0.85rem' }}>
                    {t}
                    <button onClick={() => removeTail(t)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {saved && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px', fontSize: '0.88rem', color: '#065f46' }}>✅ Fleet saved successfully!</div>}
            <button onClick={saveProfile} disabled={saving} style={{ padding: '0.85rem 2rem', background: '#f0c040', color: '#1a1d24', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Fleet'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
