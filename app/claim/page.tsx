'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function ClaimForm() {
  const searchParams = useSearchParams();
  const operatorId = searchParams.get('operator');
  const [operator, setOperator] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (operatorId) {
      supabase.from('operators').select('id, name, region, fleet_size').eq('id', operatorId).maybeSingle().then(({ data }) => {
        if (data) setOperator(data);
      });
    }
  }, [operatorId]);

  async function handleSubmit() {
    if (!name || !email) return setError('Please fill in your name and email.');
    if (!email.includes('@')) return setError('Please enter a valid email address.');
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('operator_claims').insert({
      operator_id: operatorId,
      contact_name: name,
      contact_email: email,
      contact_title: title,
      status: 'pending',
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSubmitted(true);
  }

  if (submitted) return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', color: '#1a1d24', marginBottom: '0.75rem' }}>Claim Submitted!</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          We'll verify your connection to <strong>{operator?.name}</strong> and get back to you at <strong>{email}</strong> within 1-2 business days.
        </p>
        <a href="/" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#1a1d24', color: '#f0c040', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>Back to Operators</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <a href={operator ? `/operators/${operator.id}` : '/'} style={{ color: '#f0c040', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>← Back</a>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✈</div>
            <h1 style={{ fontSize: '1.5rem', color: '#1a1d24', marginBottom: '0.5rem' }}>Claim Your Operator Profile</h1>
            {operator && <div style={{ background: '#fffbeb', border: '1px solid #f0c040', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#1a1d24' }}>{operator.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'capitalize' }}>{operator.region} · {operator.fleet_size}</div>
            </div>}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Full Name *</label>
            <input type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1d24', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email *</label>
            <input type="email" placeholder="john@operator.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1d24', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Title</label>
            <input type="text" placeholder="e.g. Director of Operations" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2ddd4', borderRadius: '6px', fontSize: '0.95rem', color: '#1a1d24', boxSizing: 'border-box' }} />
          </div>

          <div style={{ background: '#f4f1eb', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
            🔒 We'll verify your connection to this operator before granting access. Use your work email for faster verification.
          </div>

          {error && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '6px', fontSize: '0.88rem', color: '#991b1b' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#1a1d24', color: '#f0c040', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ClaimPage() {
  return <Suspense><ClaimForm /></Suspense>;
}
