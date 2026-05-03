'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  fleet_size: string;
}

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} onClick={() => onChange(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= (hover || value) ? '#f0c040' : '#e2ddd4', padding: 0, lineHeight: 1 }}>★</button>
        ))}
        <span style={{ fontSize: '0.85rem', color: '#6b7280', alignSelf: 'center', marginLeft: '0.5rem' }}>
          {(hover || value) === 0 ? 'Select rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hover || value]}
        </span>
      </div>
    </div>
  );
}

interface Aircraft {
  id: string;
  tail_number: string;
  aircraft_type: string;
}

function ReviewForm() {
  const searchParams = useSearchParams();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [safety, setSafety] = useState(0);
  const [service, setService] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [value, setValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [tailNumber, setTailNumber] = useState('');
  const [dateFlown, setDateFlown] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [operatorAircraft, setOperatorAircraft] = useState<Aircraft[]>([]);
  const [aircraftLoading, setAircraftLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login';
      else setUser(data.user);
    });
    supabase.from('operators').select('id, name, fleet_size').order('name').then(({ data }) => {
      if (data) {
        setOperators(data);
        const operatorId = searchParams.get('operator');
        if (operatorId) {
          const found = data.find((o: Operator) => o.id === operatorId);
          if (found) { setSelectedOperator(found); setSearch(found.name); }
        }
      }
    });
    // Pre-fill tail from aircraft directory link
    const tailParam = searchParams.get('tail');
    if (tailParam) setTailNumber(tailParam);
  }, []);

  // When operator is selected, load their aircraft from the registry
  useEffect(() => {
    if (!selectedOperator) { setOperatorAircraft([]); return; }
    setAircraftLoading(true);
    supabase
      .from('aircraft')
      .select('id, tail_number, aircraft_type')
      .or(`operator_name.ilike.%${selectedOperator.name}%,dba_name.ilike.%${selectedOperator.name}%`)
      .order('tail_number')
      .then(({ data }) => {
        setOperatorAircraft(data || []);
        setAircraftLoading(false);
      });
  }, [selectedOperator]);

  const filtered = operators.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8);

  async function handleSubmit() {
    if (!selectedOperator) return setError('Please select an operator.');
    if (!safety || !service || !punctuality || !value) return setError('Please rate all four categories.');
    if (reviewText.length < 20) return setError('Please write at least 20 characters in your review.');
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('reviews').insert({
      operator_id: selectedOperator.id,
      user_id: user.id,
      safety_score: safety,
      service_score: service,
      punctuality_score: punctuality,
      value_score: value,
      review_text: reviewText,
      tail_number: tailNumber || null,
      date_flown: dateFlown || null,
      is_approved: false,
      is_verified: false,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSubmitted(true);
  }

  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1d24', marginBottom: '0.75rem' }}>Review Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
            Thank you for your review of <strong>{selectedOperator?.name}</strong>. It will be published after a quick review by our team — usually within 24 hours.
          </p>
          <a href="/" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#1a1d24', color: '#f0c040', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Back to Operators</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <a href="/" style={{ color: '#f0c040', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>← Back to operators</a>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.5rem' }}>✈</div>
            <h1 style={{ fontSize: '1.6rem', color: '#1a1d24', margin: '0.25rem 0 0' }}>Write a Review</h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Share your experience to help other flyers</p>
          </div>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operator *</label>
            {selectedOperator ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1.5px solid #f0c040', borderRadius: '6px', background: '#fffbeb' }}>
                <span style={{ fontWeight: 600, color: '#1a1d24' }}>{selectedOperator.name}</span>
                <button onClick={() => { setSelectedOperator(null); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.1rem' }}>✕</button>
              </div>
            ) : (
              <>
                <input type="text" placeholder="Search for an operator..." value={search} onChange={e => { setSearch(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1d24', boxSizing: 'border-box' }} />
                {showDropdown && search && filtered.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #e2ddd4', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, marginTop: '4px' }}>
                    {filtered.map(op => (
                      <div key={op.id} onClick={() => { setSelectedOperator(op); setSearch(op.name); setShowDropdown(false); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f4f1eb', fontSize: '0.95rem', color: '#1a1d24' }} onMouseEnter={e => (e.currentTarget.style.background = '#f4f1eb')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                        {op.name}<span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem', textTransform: 'capitalize' }}>({op.fleet_size})</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ borderTop: '1px solid #f4f1eb', paddingTop: '1.5rem', marginBottom: '0.5rem' }}>
            <StarRating label="Safety" value={safety} onChange={setSafety} />
            <StarRating label="Service" value={service} onChange={setService} />
            <StarRating label="Punctuality" value={punctuality} onChange={setPunctuality} />
            <StarRating label="Value for Money" value={value} onChange={setValue} />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Review *</label>
            <textarea placeholder="Describe your experience — aircraft condition, crew professionalism, departure punctuality, catering..." value={reviewText} onChange={e => setReviewText(e.target.value)} rows={5} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1d24', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif' }} />
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>{reviewText.length} characters (minimum 20)</p>
          </div>
          <div style={{ background: '#f4f1eb', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Optional — helps verify your review</p>

            {/* Aircraft picker — shown when operator has known tails */}
            {selectedOperator && (operatorAircraft.length > 0 || aircraftLoading) && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                  Select Aircraft {aircraftLoading ? '(loading...)' : `(${operatorAircraft.length} on file)`}
                </label>
                <select
                  value={tailNumber}
                  onChange={e => setTailNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.9rem', color: '#1a1d24', boxSizing: 'border-box', background: '#fff', fontFamily: 'monospace' }}
                >
                  <option value="">— Select a tail number —</option>
                  {operatorAircraft.map(ac => (
                    <option key={ac.id} value={ac.tail_number}>
                      {ac.tail_number} · {ac.aircraft_type}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  Or type it manually below if not listed
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Tail Number</label>
                <input type="text" placeholder="e.g. N450QS" value={tailNumber} onChange={e => setTailNumber(e.target.value.toUpperCase())} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.9rem', color: '#1a1d24', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Date Flown</label>
                <input type="date" value={dateFlown} onChange={e => setDateFlown(e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.9rem', color: '#1a1d24', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
          {error && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '6px', fontSize: '0.88rem', color: '#991b1b', fontWeight: 500 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#1a1d24', color: '#f0c040', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af' }}>Reviews are checked by our team before publishing. Only genuine flight experiences are accepted.</p>
        </div>
      </div>
    </main>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense>
      <ReviewForm />
    </Suspense>
  );
}
