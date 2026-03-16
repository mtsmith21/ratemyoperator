'use client';

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0D0F12', fontFamily: 'sans-serif' }}>
      <nav style={{ background: 'rgba(13,15,18,0.95)', borderBottom: '1px solid #242830', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <a href="/" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Rate<span style={{ color: '#D4AF37' }}>My</span>Operator</a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B929E' }}>Operators</a>
          <a href="/about" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4AF37' }}>About</a>
          <a href="/review" style={{ background: '#D4AF37', color: '#0D0F12', padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Write a Review</a>
        </div>
      </nav>
      <div style={{ background: '#13161B', borderBottom: '1px solid #242830', padding: '6rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>— Our Story —</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>Built by Aviators,<br /><span style={{ color: '#D4AF37' }}>For Aviators.</span></h1>
        <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>We got tired of the guesswork. So we built the platform we always wished existed.</p>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 2rem' }}>
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>The Problem</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>Hundreds of Operators. Only a Handful Are Excellent.</h2>
          <div style={{ width: '48px', height: '2px', background: '#D4AF37', marginBottom: '2rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9, marginBottom: '1.25rem' }}>Private aviation is supposed to be the pinnacle of travel. But for brokers and passengers who fly regularly, the reality is more complicated. There are hundreds of operators worldwide — and finding the truly excellent ones has always relied on word of mouth, gut instinct, and expensive mistakes.</p>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9 }}>A late departure here. A poorly maintained aircraft there. Crew that didn't meet expectations. These aren't small inconveniences — they're failures that erode trust in an industry built on it. And until now, there was no reliable, independent place to document them.</p>
        </section>
        <section style={{ marginBottom: '4rem', background: '#13161B', border: '1px solid #242830', borderLeft: '3px solid #D4AF37', borderRadius: '12px', padding: '3rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Mission</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', lineHeight: 1.1 }}>Radical Transparency in Private Aviation.</h2>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9 }}>RateMyOperator exists to bring honest, verified feedback to an industry that has operated on reputation and relationships for too long. We believe passengers and brokers deserve real information — rated on what actually matters: safety, service, punctuality, and value.</p>
        </section>
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>How It Works</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>Simple. Honest. Effective.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[['01', 'Find Your Operator', 'Search our database of 680+ private jet operators worldwide by name or region.'], ['02', 'Read Real Reviews', 'Browse honest ratings from verified passengers on safety, service, punctuality and value.'], ['03', 'Fly With Confidence', 'Make informed decisions backed by real experiences — not sales pitches.']].map(([num, title, desc]) => (
              <div key={num} style={{ background: '#13161B', border: '1px solid #242830', borderRadius: '10px', padding: '1.75rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#242830', lineHeight: 1, marginBottom: '0.75rem' }}>{num}</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{title}</div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Who We Are</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>We've Seen It Firsthand.</h2>
          <div style={{ width: '48px', height: '2px', background: '#D4AF37', marginBottom: '2rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9, marginBottom: '1.25rem' }}>RateMyOperator was built by aviators and experienced brokers who spent years navigating the private aviation industry — and grew frustrated by the lack of reliable, independent information about operators.</p>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9, marginBottom: '1.25rem' }}>We've seen firsthand that of the hundreds of operators out there, only a handful consistently deliver an exceptional experience. The rest range from adequate to genuinely concerning. The difference matters — especially when safety is on the line.</p>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9 }}>This platform exists to find the excellent operators, recognize them publicly, and hold the rest accountable through honest, transparent feedback.</p>
        </section>
        <section style={{ marginBottom: '4rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '3rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>For Operators</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', lineHeight: 1.1 }}>The Best Operators Have Nothing to Hide.</h2>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.9, marginBottom: '2rem' }}>If you run an excellent operation, this platform is your opportunity to prove it. Claim your profile, add your fleet details, and let your reputation speak for itself. The operators who embrace transparency are the ones passengers and brokers will trust — and book.</p>
          <a href="/" style={{ display: 'inline-block', background: '#D4AF37', color: '#0D0F12', padding: '0.85rem 2rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Find Your Operator →</a>
        </section>
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Standards</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>Every Review is Checked.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[['✓', 'Human reviewed', 'Every review is read by our team before publishing.'], ['✈', 'Verified flights', 'Tail numbers help us verify genuine flight experiences.'], ['⚖', 'No pay to play', 'Operators cannot pay to remove or suppress reviews.'], ['🌍', 'Global coverage', '680+ operators across the US, Europe, and beyond.']].map(([icon, title, desc]) => (
              <div key={title} style={{ background: '#13161B', border: '1px solid #242830', borderRadius: '10px', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div style={{ fontSize: '1.2rem' }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section style={{ textAlign: 'center', padding: '3rem', background: '#13161B', border: '1px solid #242830', borderRadius: '12px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✈</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>Flown Recently?</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>Share your experience and help the private aviation community make better decisions.</p>
          <a href="/review" style={{ display: 'inline-block', background: '#D4AF37', color: '#0D0F12', padding: '0.85rem 2rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Write a Review →</a>
        </section>
      </div>
    </main>
  );
}
