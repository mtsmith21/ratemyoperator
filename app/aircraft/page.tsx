'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Aircraft {
  id: string;
  operator_name: string;
  dba_name: string | null;
  aircraft_type: string;
  tail_number: string;
}

export default function AircraftDirectoryPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [types, setTypes] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  // Load distinct aircraft types for filter dropdown
  useEffect(() => {
    supabase
      .from('aircraft')
      .select('aircraft_type')
      .then(({ data }) => {
        if (data) {
          const unique = Array.from(new Set(data.map((r: { aircraft_type: string }) => r.aircraft_type)))
            .sort() as string[];
          setTypes(['All Types', ...unique]);
        }
      });
  }, []);

  const fetchAircraft = useCallback(async (searchVal: string, typeVal: string, pageVal: number) => {
    setLoading(true);
    let query = supabase
      .from('aircraft')
      .select('id, operator_name, dba_name, aircraft_type, tail_number', { count: 'exact' })
      .order('operator_name', { ascending: true })
      .range(pageVal * PAGE_SIZE, (pageVal + 1) * PAGE_SIZE - 1);

    if (typeVal !== 'All Types') {
      query = query.eq('aircraft_type', typeVal);
    }

    if (searchVal.trim()) {
      query = query.or(
        `operator_name.ilike.%${searchVal}%,dba_name.ilike.%${searchVal}%,tail_number.ilike.%${searchVal}%,aircraft_type.ilike.%${searchVal}%`
      );
    }

    const { data, count } = await query;
    if (data) setAircraft(data);
    if (count !== null) setTotal(count);
    setLoading(false);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(0);
      fetchAircraft(search, typeFilter, 0);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, typeFilter, fetchAircraft]);

  useEffect(() => {
    fetchAircraft(search, typeFilter, page);
  }, [page]); // eslint-disable-line

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #F8F7F4; --bg2: #FFFFFF; --bg3: #F0EDE8;
          --border: #E0DDD6; --border2: #C8C4BC;
          --gold: #D4AF37; --gold2: #F0C040;
          --gold-dim: rgba(212,175,55,0.12); --gold-border: rgba(212,175,55,0.25);
          --text: #1a1a1a; --text2: #555550; --text3: #888880;
        }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        input, select { outline: none; font-family: inherit; }

        .nav { position: sticky; top: 0; z-index: 100; background: rgba(13,15,18,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 60px; }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.05em; color: #FFFFFF; }
        .nav-logo span { color: var(--gold); }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-link { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; transition: color 0.2s; }
        .nav-link:hover, .nav-link.active { color: #fff; }
        .nav-cta { background: var(--gold); color: #0D0F12; padding: 0.5rem 1.25rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

        .page-header { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 2.5rem 2rem 2rem; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--gold); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .page-eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--gold); }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 4vw, 3.5rem); letter-spacing: 0.02em; color: var(--text); margin-bottom: 0.5rem; }
        .page-sub { color: var(--text2); font-size: 0.9rem; }

        .search-bar { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 1.25rem 2rem; }
        .search-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .search-wrap { flex: 1; min-width: 200px; position: relative; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text3); }
        .search-input { width: 100%; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem 0.75rem 2.5rem; color: var(--text); font-size: 0.9rem; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--gold-border); }
        .search-input::placeholder { color: var(--text3); }
        .filter-select { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; min-width: 160px; }
        .result-count { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--text3); letter-spacing: 0.05em; white-space: nowrap; }

        .main { max-width: 1200px; margin: 0 auto; padding: 2rem; }

        .table-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        thead { background: var(--bg3); border-bottom: 1px solid var(--border); }
        th { padding: 0.75rem 1rem; text-align: left; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); font-weight: 500; }
        td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--bg3); }
        .tail-badge { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: var(--gold); background: var(--gold-dim); border: 1px solid var(--gold-border); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; }
        .review-link { background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold); padding: 0.3rem 0.7rem; border-radius: 5px; font-size: 0.72rem; font-weight: 600; transition: all 0.15s; white-space: nowrap; }
        .review-link:hover { background: var(--gold); color: #0D0F12; }

        /* Mobile cards */
        .card-list { display: none; flex-direction: column; gap: 0.75rem; }
        .ac-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .ac-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
        .ac-card-name { font-weight: 700; font-size: 0.9rem; color: var(--text); line-height: 1.3; }
        .ac-card-dba { font-size: 0.72rem; color: var(--text3); }
        .ac-card-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .ac-card-type { font-size: 0.78rem; color: var(--text2); }

        @media (max-width: 640px) {
          .nav-links { display: none; }
          .table-wrap { display: none; }
          .card-list { display: flex; }
          .search-inner { flex-direction: column; align-items: stretch; }
          .filter-select { width: 100%; }
          .main { padding: 1rem; }
          .page-header { padding: 1.5rem 1rem 1.25rem; }
        }

        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 0; flex-wrap: wrap; gap: 1rem; }
        .page-btn { background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { border-color: var(--gold-border); color: var(--gold); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-info { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--text3); }

        .empty { padding: 4rem 2rem; text-align: center; color: var(--text3); }
        .loading-row td { color: var(--text3); text-align: center; padding: 3rem; }

        @media (max-width: 700px) {
          .nav-links { display: none; }
          th.hide-mobile, td.hide-mobile { display: none; }
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Rate<span>My</span>Operator</a>
        <div className="nav-links">
          <a href="/" className="nav-link">Operators</a>
          <a href="/aircraft" className="nav-link active">Aircraft</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/review" className="nav-cta">Write a Review</a>
        </div>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-eyebrow">FAA Part 135 Registry</div>
          <h1 className="page-title">Aircraft Directory</h1>
          <p className="page-sub">Search operators, tail numbers, and aircraft types from the FAA Part 135 registry.</p>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-inner">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search operator, tail number, or aircraft type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="result-count">
            {loading ? 'Loading...' : `${total.toLocaleString()} aircraft`}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Aircraft Type</th>
                <th>Tail Number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>Loading...</td></tr>
              ) : aircraft.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>No aircraft found.</td></tr>
              ) : (
                aircraft.map(ac => (
                  <tr key={ac.id}>
                    <td style={{ fontWeight: 600 }}>
                      {ac.dba_name ? ac.dba_name : ac.operator_name}
                      {ac.dba_name && <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 400, marginLeft: '0.4rem' }}>({ac.operator_name})</span>}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{ac.aircraft_type}</td>
                    <td><span className="tail-badge">{ac.tail_number}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <a
                        href={`/review?tail=${ac.tail_number}&operator_name=${encodeURIComponent(ac.operator_name)}`}
                        className="review-link"
                      >
                        Review →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="card-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>Loading...</div>
          ) : aircraft.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>No aircraft found.</div>
          ) : (
            aircraft.map(ac => (
              <div key={ac.id} className="ac-card">
                <div className="ac-card-top">
                  <div>
                    <div className="ac-card-name">{ac.dba_name || ac.operator_name}</div>
                    {ac.dba_name && <div className="ac-card-dba">{ac.operator_name}</div>}
                  </div>
                  <a
                    href={`/review?tail=${ac.tail_number}&operator_name=${encodeURIComponent(ac.operator_name)}`}
                    className="review-link"
                    style={{ flexShrink: 0 }}
                  >
                    Review →
                  </a>
                </div>
                <div className="ac-card-meta">
                  <span className="tail-badge">{ac.tail_number}</span>
                  <span className="ac-card-type">{ac.aircraft_type}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ← Previous
            </button>
            <div className="page-info">
              Page {page + 1} of {totalPages.toLocaleString()} · {total.toLocaleString()} total
            </div>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
