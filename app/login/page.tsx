'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Check your email for a confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    }
    setLoading(false);
  }

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✈ RateMyOperator</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>Private Jet Review Platform</p>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{isSignUp ? 'Create account' : 'Sign in'}</h2>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: '0.75rem', background: '#1a1d24', color: '#f0c040', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
      >
        {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
      </button>

      {message && (
        <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', fontSize: '0.9rem', color: '#166534' }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#1a1d24', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
          {isSignUp ? 'Sign in' : 'Sign up'}
        </span>
      </p>
    </main>
  );
}
