'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  fleet_size: string;
  region: string;
  aircraft_count: number;
  avg_rating?: number;
  review_count?: number;
}

interface Review {
  id: string;
  operator_id: string;
  safety_score: number;
  service_score: number;
  punctuality_score: number;
  value_score: number;
  review_text: string;
  created_at: string;
  operators?: { name: string };
}

export default function HomePage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [sortBy, setSortBy] = useState('name');
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    async function fetchData() {
      const { data: ops } = await supabase
        .from('operators')
        .select('id, name, fleet_size, region, aircraft_count')
        .order('name', { ascending: true });

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, operator_id, safety_score, service_score, punctuality_score, value_score, review_text, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (ops) {
        const enriched = ops.map(op => {
          const opReviews = reviewData?.filter(r => r.operator_id === op.id) || [];
          const count = opReviews.length;
          const avg = count > 0
            ? opReviews.reduce((s, r) => s + (r.safety_score + r.service_score + r.punctuality_score + r.value_score) / 4, 0) / count
            : 0;
          return { ...op, avg_rating: parseFloat(avg.toFixed(1)), review_count: count };
        });
        setOperators(enriched);
      }

      if (reviewData) {
        const withNames = await Promise.all(
          reviewData.slice(0, 5).map(async r => {
            const op = ops?.find(o => o.id === r.operator_id);
            return { ...r, operators: { name: op?.name || 'Unknown' } };
          })
        );
        setReviews(withNames);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const regions = ['All Regions', ...Array.from(new Set(operators.map(o => o.region).filter(Boolean)))].sort();

  const fleetMap: Record<string, string[]> = {
    ALL: [],
    FRACTIONAL: ['fractional'],
    CHARTER: ['charter', 'small', 'mid', 'large', 'boutique'],
    MEMBERSHIP: ['membership'],
  };

  const filtered = operators.filter(op => {
    const matchSearch = op.name.toLowerCase().includes(search.toLowerCase()) ||
      op.region?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'All Regions' || op.region === regionFilter;
    const matchTab = tab === 'ALL' || fleetMap[tab]?.some(t => op.fleet_size?.toLowerCase().includes(t));
    return matchSearch && matchRegion && matchTab;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0);
    return a.name.localeCompare(b.name);
  });

  const topRated = [...operators]
    .filter(op => (op.review_count || 0) > 0)
    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    .slice(0, 5);

  const totalReviews = operators.reduce((s, o) => s + (o.review_count || 0), 0);
  const topOperator = topRated[0];

  const StarRating = ({ score, size = 12 }: { score: number; size?: number }) => (
    <span style={{ color: '#D4AF37', fontSize: size }}>
      {'★'.repeat(Math.round(score))}{'☆'.repeat(5 - Math.round(score))}
    </span>
  );

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #F8F7F4;
          --bg2: #FFFFFF;
          --bg3: #F0EDE8;
          --border: #E0DDD6;
          --border2: #C8C4BC;
          --gold: #D4AF37;
          --gold2: #F0C040;
          --gold-dim: rgba(212,175,55,0.12);
          --gold-border: rgba(212,175,55,0.25);
          --text: #1a1a1a;
          --text2: #555550;
          --text3: #888880;
          --green: #2DD4BF;
          --red: #F87171;
        }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        input, select { outline: none; font-family: inherit; }
        
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(13,15,18,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 60px; }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.05em; color: #FFFFFF; }
        .nav-logo span { color: var(--gold); }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-link { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text2); transition: color 0.2s; }
        .nav-link:hover { color: var(--text); }
        .nav-cta { background: var(--gold); color: #0D0F12; padding: 0.5rem 1.25rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.2s; }
        .nav-cta:hover { background: var(--gold2); }

        .hero { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 4rem 2rem 3.5rem; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px); opacity: 0.3; }
        .hero::after { content: ''; position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; }
        .hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--gold); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .hero-eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--gold); }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 6vw, 5.5rem); line-height: 0.92; letter-spacing: 0.02em; color: var(--text); margin-bottom: 1.5rem; }
        .hero-title .gold { color: var(--gold); display: block; }
        .hero-subtitle { color: var(--text2); font-size: 0.95rem; line-height: 1.7; max-width: 420px; margin-bottom: 2rem; }
        .hero-actions { display: flex; gap: 1rem; }
        .btn-primary { background: var(--gold); color: #0D0F12; padding: 0.85rem 2rem; border-radius: 6px; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-primary:hover { background: var(--gold2); transform: translateY(-1px); }
        .btn-secondary { background: transparent; color: var(--text); padding: 0.85rem 2rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid var(--border2); transition: all 0.2s; }
        .btn-secondary:hover { border-color: var(--gold-border); color: var(--gold); }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.5rem; }
        .stat-card.highlight { background: var(--gold-dim); border-color: var(--gold-border); grid-column: span 2; }
        .stat-number { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; color: var(--gold); line-height: 1; letter-spacing: 0.02em; }
        .stat-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); margin-top: 0.25rem; }
        .stat-highlight-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--gold); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .stat-highlight-value { font-size: 1rem; font-weight: 700; color: var(--text); }
        .stat-highlight-sub { font-size: 0.82rem; color: var(--text2); margin-top: 0.2rem; }

        .trust-bar { background: var(--bg3); border-bottom: 1px solid var(--border); padding: 0.85rem 2rem; }
        .trust-bar-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 2.5rem; flex-wrap: wrap; }
        .trust-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; font-weight: 600; color: var(--text2); }
        .trust-item span { font-size: 0.95rem; }

        .search-bar { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 1.25rem 2rem; }
        .search-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 1rem; align-items: center; }
        .search-wrap { flex: 1; position: relative; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 0.9rem; }
        .search-input { width: 100%; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem 0.75rem 2.5rem; color: var(--text); font-size: 0.9rem; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--gold-border); }
        .search-input::placeholder { color: var(--text3); }
        .filter-select { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; min-width: 140px; }
        .filter-select:focus { border-color: var(--gold-border); }

        .main-layout { max-width: 1200px; margin: 0 auto; padding: 2rem; display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
        
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .section-title { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text3); }
        .section-count { font-size: 0.78rem; color: var(--text3); }

        .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
        .tab { padding: 0.6rem 1.25rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
        .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
        .tab:hover:not(.active) { color: var(--text2); }

        .operators-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.85rem; }
        .op-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; transition: all 0.2s; display: flex; flex-direction: column; gap: 0.75rem; }
        .op-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .op-card-name { font-weight: 700; font-size: 0.92rem; color: var(--text); line-height: 1.3; }
        .op-card-meta { font-size: 0.75rem; color: var(--text3); text-transform: capitalize; }
        .op-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--border); }
        .op-rating { display: flex; flex-direction: column; gap: 0.1rem; }
        .op-rating-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--gold); line-height: 1; }
        .op-rating-count { font-size: 0.65rem; color: var(--text3); }
        .op-review-btn { background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold); padding: 0.35rem 0.85rem; border-radius: 5px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em; transition: all 0.2s; }
        .op-card:hover .op-review-btn { background: var(--gold); color: #0D0F12; }
        .no-reviews { font-size: 0.75rem; color: var(--text3); }

        .sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
        .sidebar-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .sidebar-card-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.6rem; }
        .sidebar-card-icon { font-size: 0.9rem; }
        .sidebar-card-title { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text2); font-weight: 500; }
        .sidebar-card-body { padding: 0.5rem 0; }

        .leaderboard-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1.25rem; transition: background 0.15s; cursor: pointer; }
        .leaderboard-item:hover { background: var(--bg3); }
        .leaderboard-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: var(--text3); width: 20px; text-align: center; }
        .leaderboard-rank.gold { color: var(--gold); }
        .leaderboard-rank.silver { color: #A8A9AD; }
        .leaderboard-rank.bronze { color: #CD7F32; }
        .leaderboard-name { flex: 1; font-size: 0.82rem; font-weight: 600; color: var(--text); }
        .leaderboard-score { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--gold); font-weight: 500; }

        .recent-review { padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border); }
        .recent-review:last-child { border-bottom: none; }
        .recent-review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; }
        .recent-review-op { font-size: 0.8rem; font-weight: 700; color: var(--text); }
        .recent-review-time { font-size: 0.68rem; color: var(--text3); font-family: 'DM Mono', monospace; }
        .recent-review-text { font-size: 0.78rem; color: var(--text2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .verified-badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.65rem; color: var(--green); font-family: 'DM Mono', monospace; letter-spacing: 0.05em; }

        .empty-state { padding: 4rem 2rem; text-align: center; color: var(--text3); font-size: 0.9rem; }

        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
          .main-layout { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          .nav-links { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">Rate<span>My</span>Operator</div>
        <div className="nav-links">
          <a href="/" className="nav-link">Operators</a>
          <a href="/aircraft" className="nav-link">Aircraft</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/review" className="nav-cta">Write a Review</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">Cleared for takeoff</div>
            <h1 className="hero-title">
              The World's
              <span className="gold">Private Jet</span>
              Review Platform
            </h1>
            <p className="hero-subtitle">
              Honest, verified ratings from real passengers. Rate your operator on safety, service, punctuality, and value.
            </p>
            <div className="hero-actions">
              <a href="/review" className="btn-primary">✍ Write a Review</a>
              <a href="#operators" className="btn-secondary">Browse Operators ↓</a>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{loading ? '—' : totalReviews.toLocaleString()}</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loading ? '—' : operators.length}</div>
              <div className="stat-label">Operators</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loading ? '—' : operators.filter(o => (o.review_count || 0) > 0).length}</div>
              <div className="stat-label">Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loading ? '—' : topOperator ? topOperator.avg_rating?.toFixed(1) : '—'}</div>
              <div className="stat-label">Top Score</div>
            </div>
            {topOperator && (
              <div className="stat-card highlight">
                <div className="stat-highlight-label">🏆 Top Rated {new Date().getFullYear()}</div>
                <a href={`/operators/${topOperator.id}`}>
                  <div className="stat-highlight-value">{topOperator.name}</div>
                  <div className="stat-highlight-sub">
                    {topOperator.avg_rating?.toFixed(1)} / 5.0 · {topOperator.review_count} reviews
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          <div className="trust-item"><span>🔒</span> 100% Anonymous Reviews</div>
          <div className="trust-item"><span>✓</span> Verified Flight Experiences</div>
          <div className="trust-item"><span>✈</span> Independent & Unbiased</div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <div className="search-inner">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search operators by name or region..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort: A–Z</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
          </select>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-layout" id="operators">
        <div>
          <div className="section-header">
            <div className="section-title">Operator Directory</div>
            <div className="section-count">{filtered.length} operators</div>
          </div>

          <div className="tabs">
            {['ALL'].map(t => (
              <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">Loading operators...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No operators found matching your search.</div>
          ) : (
            <div className="operators-grid">
              {filtered.map(op => (
                <a key={op.id} href={`/operators/${op.id}`} className="op-card">
                  <div>
                    <div className="op-card-name">{op.name}</div>
                    <div className="op-card-meta">{op.region} · {op.aircraft_count} aircraft</div>
                  </div>
                  <div className="op-card-footer">
                    {(op.review_count || 0) > 0 ? (
                      <div className="op-rating">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="op-rating-num">{op.avg_rating?.toFixed(1)}</span>
                          <StarRating score={op.avg_rating || 0} size={11} />
                        </div>
                        <div className="op-rating-count">{op.review_count} review{op.review_count !== 1 ? 's' : ''}</div>
                      </div>
                    ) : (
                      <div className="no-reviews">No reviews yet</div>
                    )}
                    <span onClick={(e) => { e.preventDefault(); window.location.href=`/review?operator=${op.id}`; }} className="op-review-btn">Review →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          {topRated.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <span className="sidebar-card-icon">🏆</span>
                <span className="sidebar-card-title">Top Rated {new Date().getFullYear()}</span>
              </div>
              <div className="sidebar-card-body">
                {topRated.map((op, i) => (
                  <a key={op.id} href={`/operators/${op.id}`} className="leaderboard-item">
                    <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>{i + 1}</div>
                    <div className="leaderboard-name">{op.name}</div>
                    <div className="leaderboard-score">{op.avg_rating?.toFixed(1)}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <span className="sidebar-card-icon">⚡</span>
                <span className="sidebar-card-title">Recent Reviews</span>
              </div>
              <div className="sidebar-card-body">
                {reviews.map(r => (
                  <div key={r.id} className="recent-review">
                    <div className="recent-review-header">
                      <div className="recent-review-op">{r.operators?.name}</div>
                      <div className="recent-review-time">{timeAgo(r.created_at)}</div>
                    </div>
                    <div style={{ marginBottom: '0.35rem' }}>
                      <StarRating score={(r.safety_score + r.service_score + r.punctuality_score + r.value_score) / 4} size={11} />
                    </div>
                    {r.review_text && <div className="recent-review-text">"{r.review_text}"</div>}
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="verified-badge">✓ Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card" style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✈</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Flown recently?</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.25rem', lineHeight: 1.5 }}>Help others make informed decisions. Share your experience.</div>
              <a href="/review" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}>Write a Review</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
