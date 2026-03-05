'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setMessage(error.message); setIsError(true); }
      else setMessage('✓ Check your email for a confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage(error.message); setIsError(true); }
      else window.location.href = '/';
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#1a1d24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '1rem'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem',
cat > app/login/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setMessage(error.message); setIsError(true); }
      else setMessage('✓ Check your email for a confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage(error.message); setIsError(true); }
      else window.location.href = '/';
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#1a1d24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '1rem'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✈</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.05em', color: '#1a1d24', margin: 0 }}>
            Rate<span style={{ color: '#f0c040' }}>My</span>Operator
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Private Jet Review Platform</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#f4f1eb', borderRadius: '8px', padding: '4px', marginBottom: '1.75rem' }}>
          {['Sign in', 'Sign up'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setIsSignUp(i === 1)}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: (i === 1) === isSignUp ? '#1a1d24' : 'transparent',
                color: (i === 1) === isSignUp ? '#f0c040' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1.5px solid #e2ddd4',
              borderRadius: '6px',
              fontSize: '0.95rem',
              color: '#1a1d24',
              background: '#fff',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1.5px solid #e2ddd4',
              borderRadius: '6px',
              fontSize: '0.95rem',
              color: '#1a1d24',
              background: '#fff',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: loading ? '#9ca3af' : '#1a1d24',
            color: '#f0c040',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: isError ? '#fef2f2' : '#f0fdf4',
            border: `1.5px solid ${isError ? '#fca5a5' : '#86efac'}`,
            borderRadius: '6px',
            fontSize: '0.88rem',
            color: isError ? '#991b1b' : '#166534',
            fontWeight: 500
          }}>
            {message}
          </div>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#9ca3af' }}>
          By signing up you agree to our{' '}
          <a href="/terms" style={{ color: '#1a1d24', fontWeight: 600 }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#1a1d24', fontWeight: 600 }}>Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
