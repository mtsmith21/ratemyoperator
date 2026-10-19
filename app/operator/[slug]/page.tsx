import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOperators, getOperatorBySlug, getApprovedReviews, getFleet, scoreSummary } from '@/lib/data';
import { isPart135Tail, formatFaaDate } from '@/lib/faa';
import { operatorTag } from '@/lib/operatorTags';
import { ntsbEventsForFleet, ntsbEventsForTail, ntsbLink, formatNtsbDate, formatEventDate, NTSB_SINCE_YEAR, INJURY_COLORS } from '@/lib/ntsb';
import { fleetAge, yearBuilt, formatRegistryDate } from '@/lib/fleetAge';

// Pages are built at deploy time and refreshed every minute (ISR); new operators render on first visit.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ops = await getOperators();
  return ops.map(op => ({ slug: op.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function regionLabel(region: string | null) {
  if (!region) return '';
  return region === 'US' ? 'United States' : region;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const op = await getOperatorBySlug(slug);
  if (!op) return { title: 'Operator not found' };
  const reviews = (await getApprovedReviews()).filter(r => r.operator_id === op.id);
  const summary = scoreSummary(reviews);
  const fleet = await getFleet(op.name);
  const aircraft = op.aircraft_count || fleet.length;
  const parts = [
    `${op.name} private jet operator reviews and fleet`,
    regionLabel(op.region) ? `based in ${regionLabel(op.region)}` : '',
  ].filter(Boolean).join(', ');
  const rating = summary
    ? ` Rated ${summary.overall.toFixed(1)}/5 from ${summary.count} review${summary.count !== 1 ? 's' : ''} on safety, service, punctuality and value.`
    : ' See safety, service, punctuality and value ratings, or be the first to review.';
  const description = `${parts}.${aircraft ? ` ${aircraft} aircraft${fleet.length ? ' with tail numbers and FAA Part 135 status' : ''}.` : ''}${rating}`;
  const url = `/operator/${op.slug}`;
  return {
    title: `${op.name} Reviews & Fleet`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${op.name} Reviews & Fleet | RateMyOperator`, description, url, type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RateMyOperator — Private jet operator reviews' }] },
    twitter: { card: 'summary', title: `${op.name} Reviews & Fleet | RateMyOperator`, description },
  };
}

function Stars({ score }: { score: number }) {
  return (
    <span style={{ color: '#f0c040' }}>
      {'★'.repeat(Math.round(score))}{'☆'.repeat(5 - Math.round(score))}
    </span>
  );
}

const card = { background: '#242830', borderRadius: '12px', border: '1px solid #2a2d35' } as const;

export default async function OperatorPage({ params }: Props) {
  const { slug } = await params;
  const operator = await getOperatorBySlug(slug);
  if (!operator) notFound();

  const [allReviews, fleet] = await Promise.all([getApprovedReviews(), getFleet(operator.name)]);
  const reviews = allReviews.filter(r => r.operator_id === operator.id);
  const summary = scoreSummary(reviews);
  const tag = operatorTag(operator.name);
  const part135Count = fleet.filter(a => isPart135Tail(a.tail_number)).length;
  const reviewHref = `/review?operator=${operator.id}`;
  const aircraftCount = operator.aircraft_count || fleet.length;
  const tails = fleet.map(a => a.tail_number);
  const events = ntsbEventsForFleet(tails);
  const tailsWithEvents = new Set(events.map(e => e.tail)).size;
  const age = fleetAge(tails);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: operator.name,
    url: `https://www.ratemyoperator.com/operator/${operator.slug}`,
    ...(operator.website ? { sameAs: [operator.website] } : {}),
    ...(summary
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: summary.overall.toFixed(1), reviewCount: summary.count, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <main style={{ minHeight: '100vh', background: '#1a1d24', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ background: '#1a1d24', borderBottom: '1px solid #2a2d35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>✈</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Rate<span style={{ color: '#f0c040' }}>My</span>Operator</span>
        </Link>
        <a href={reviewHref} style={{ background: '#f0c040', color: '#1a1d24', padding: '0.4rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Write a Review</a>
      </header>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link href="/#operators" style={{ color: '#f0c040', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>← All operators</Link>
        <div style={{ ...card, padding: '2rem', margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 800 }}>{operator.name}</h1>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                {[regionLabel(operator.region), aircraftCount ? `${aircraftCount} aircraft` : ''].filter(Boolean).join(' · ')}
              </p>
              {tag && <p style={{ display: 'inline-block', marginTop: '0.6rem', padding: '0.15rem 0.6rem', borderRadius: '999px', border: '1px solid #4b5563', color: '#d1d5db', fontSize: '0.75rem' }}>{tag}</p>}
              {part135Count > 0 && (
                <p style={{ color: '#34d399', margin: '0.6rem 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {part135Count} of {fleet.length} aircraft on the FAA Part 135 list
                </p>
              )}
              {age && (
                <p style={{ color: '#d1d5db', margin: '0.4rem 0 0', fontSize: '0.85rem' }}>
                  Fleet age: avg. built {age.avgYear} (~{age.avgAge} yrs){age.oldest !== age.newest ? `, range ${age.oldest}–${age.newest}` : ''}
                </p>
              )}
              {operator.website && (
                <p style={{ margin: '0.6rem 0 0', fontSize: '0.85rem' }}>
                  <a href={operator.website} rel="nofollow noopener" target="_blank" style={{ color: '#f0c040' }}>{operator.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                </p>
              )}
            </div>
            {summary && (
              <div style={{ textAlign: 'center', background: '#1a1d24', borderRadius: '10px', padding: '1rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f0c040', lineHeight: 1 }}>{summary.overall.toFixed(1)}</div>
                <Stars score={summary.overall} />
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>{summary.count} review{summary.count !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>
          {operator.description && <p style={{ color: '#d1d5db', lineHeight: 1.6, marginTop: '1.25rem', fontSize: '0.95rem' }}>{operator.description}</p>}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', marginTop: '1.5rem', background: '#1a1d24', borderRadius: '8px', padding: '1rem' }}>
              {([['Safety', summary.safety], ['Service', summary.service], ['Punctuality', summary.punctuality], ['Value', summary.value]] as const).map(([label, score]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{score.toFixed(1)}</div>
                  <Stars score={score} />
                </div>
              ))}
            </div>
          )}
          <a href={reviewHref} style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', padding: '0.85rem', background: '#f0c040', color: '#1a1d24', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Write a Review for {operator.name}</a>
          {!operator.is_claimed && (
            <a href={`/claim?operator=${operator.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', padding: '0.7rem', background: 'transparent', color: '#e5e7eb', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #4b5563' }}>
              Claim this page <span style={{ color: '#9ca3af', fontWeight: 400 }}>· Are you {operator.name}?</span>
            </a>
          )}
        </div>


        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 0.4rem' }}>Safety record</h2>
        <div id="safety" style={{ ...card, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          {fleet.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
              No tail numbers on file for {operator.name}, so there is no NTSB record to show yet.
            </p>
          ) : events.length === 0 ? (
            <p style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
              ✓ No NTSB events on record for these tails since {NTSB_SINCE_YEAR}.
            </p>
          ) : (
            <>
              <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem' }}>
                {events.length} NTSB event{events.length !== 1 ? 's' : ''} since {NTSB_SINCE_YEAR} on {tailsWithEvents} of {fleet.length} tail{fleet.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {events.map(e => (
                  <div key={`${e.tail}-${e.ntsb_no}`} style={{ background: '#1a1d24', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                        {formatEventDate(e.date)} · <span style={{ fontFamily: 'monospace' }}>{e.tail}</span> · {e.type}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Injuries: <span style={{ color: INJURY_COLORS[e.injury] || '#9ca3af', fontWeight: 600 }}>{e.injury}{e.fatal ? ` (${e.fatal} fatal)` : ''}</span>
                        {e.damage ? ` · Damage: ${e.damage}` : ''}
                        {e.far_part ? ` · Part ${e.far_part}` : ''}
                        {e.location ? ` · ${e.location}` : ''}
                      </div>
                    </div>
                    <a href={ntsbLink(e.ntsb_no)} target="_blank" rel="noopener" style={{ color: '#f0c040', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>NTSB {e.ntsb_no} ↗</a>
                  </div>
                ))}
              </div>
            </>
          )}
          {fleet.length > 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '1rem 0 0', lineHeight: 1.5 }}>
              Source: NTSB aviation accident database, data as of {formatNtsbDate()}. Matched to the tails above by N-number and airframe serial number; an event may predate {operator.name}&apos;s operation of the aircraft.
            </p>
          )}
        </div>

        <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{reviews.length > 0 ? `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}` : 'No Reviews Yet'}</h2>
        {reviews.length === 0 ? (
          <div style={{ ...card, padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Be the first to review {operator.name}</p>
            <a href={reviewHref} style={{ padding: '0.75rem 2rem', background: '#1a1d24', color: '#f0c040', border: '1px solid #f0c040', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>Write a Review</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ ...card, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '0.75rem' }}>
                    {([['Safety', review.safety_score], ['Service', review.service_score], ['Punctuality', review.punctuality_score], ['Value', review.value_score]] as const).map(([label, score]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>{label}</div>
                        <Stars score={score} />
                      </div>
                    ))}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                    {review.date_flown && `Flew ${new Date(review.date_flown).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })} · `}
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    {review.tail_number && ` · ${review.tail_number}`}
                  </div>
                </div>
                <p style={{ color: '#d1d5db', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{review.review_text}</p>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: '2.5rem 0 0.4rem' }}>Fleet{fleet.length ? ` (${fleet.length} tail${fleet.length !== 1 ? 's' : ''} on file)` : ''}</h2>
        {fleet.length === 0 ? (
          <div style={{ ...card, padding: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
            No tail numbers on file for {operator.name} yet.
          </div>
        ) : (
          <>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0 0 1rem' }}>
              From FAA records. <span style={{ color: '#34d399', fontWeight: 600 }}>Part 135</span> = tail appears on the FAA Part 135 operators and aircraft list (dated {formatFaaDate()}). Year built from the FAA aircraft registry ({formatRegistryDate()}). NTSB = events since {NTSB_SINCE_YEAR}.
            </p>
            <div style={{ ...card, overflowX: 'auto' }}>
              <style>{`@media (max-width: 480px) { .fleet-table th, .fleet-table td { padding: 0.5rem 0.4rem !important; font-size: 0.78rem; } .fleet-table th:first-child, .fleet-table td:first-child { padding-left: 0.75rem !important; } }`}</style>
              <table className="fleet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#1f232a', color: '#9ca3af', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.7rem 1rem' }}>Tail</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.7rem 0.5rem' }}>Built</th>
                    <th style={{ padding: '0.7rem 0.5rem' }}>NTSB</th>
                    <th style={{ padding: '0.7rem 1rem', textAlign: 'right' }}>FAA</th>
                  </tr>
                </thead>
                <tbody>
                  {fleet.map(a => (
                    <tr key={a.tail_number} style={{ borderTop: '1px solid #2a2d35' }}>
                      <td style={{ padding: '0.6rem 1rem', color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>
                        <a href={`/review?operator=${operator.id}&tail=${encodeURIComponent(a.tail_number)}`} style={{ color: '#fff', textDecoration: 'none' }}>{a.tail_number}</a>
                      </td>
                      <td style={{ padding: '0.6rem 1rem', color: '#d1d5db' }}>{a.aircraft_type}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#d1d5db' }}>{yearBuilt(a.tail_number) ?? '—'}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        {(() => {
                          const n = ntsbEventsForTail(a.tail_number).length;
                          return n ? <a href="#safety" style={{ color: '#fb923c', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>{n} event{n !== 1 ? 's' : ''}</a> : <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>None</span>;
                        })()}
                      </td>
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                        {isPart135Tail(a.tail_number) ? (
                          <span title={`On the FAA Part 135 list dated ${formatFaaDate()}`} style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Part 135</span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>Not on list</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
