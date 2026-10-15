'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { peekRememberedNext, takeRememberedNext } from '@/lib/authRedirect';

// After someone confirms their email, Supabase may drop them on the home page.
// If they started from "Write a Review" (or similar), send them back there once they're signed in.
export default function ResumeAfterAuth() {
  useEffect(() => {
    if (!peekRememberedNext()) return;
    const resume = () => {
      const next = takeRememberedNext();
      if (next && next !== window.location.pathname + window.location.search) window.location.replace(next);
    };
    supabase.auth.getSession().then(({ data }) => { if (data.session) resume(); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) resume();
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
