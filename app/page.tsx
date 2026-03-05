import { supabase } from '@/lib/supabase';

interface Operator {
  id: string;
  name: string;
  aircraft_count: number;
  fleet_size: string;
  region: string;
}

export default async function Home() {
  const { data: operators, error } = await supabase
    .from('operators')
    .select('*')
    .order('aircraft_count', { ascending: false });

  if (error) {
    console.error('Error fetching operators:', error);
  }

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✈ RateMyOperator</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Private Jet Review Platform</p>
      <p style={{ marginBottom: '1rem', color: '#444' }}>
        <strong>{operators?.length ?? 0}</strong> operators loaded from database
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1a1d24', color: '#fff' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Operator</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Aircraft</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fleet Size</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Region</th>
          </tr>
        </thead>
        <tbody>
          {operators?.map((op: Operator, i: number) => (
            <tr key={op.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafaf8' }}>
              <td style={{ padding: '0.65rem 0.75rem', color: '#999' }}>{i + 1}</td>
              <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{op.name}</td>
              <td style={{ padding: '0.65rem 0.75rem' }}>{op.aircraft_count}</td>
              <td style={{ padding: '0.65rem 0.75rem', textTransform: 'capitalize' }}>{op.fleet_size}</td>
              <td style={{ padding: '0.65rem 0.75rem' }}>{op.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
