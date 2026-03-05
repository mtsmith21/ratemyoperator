export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tailNumber = searchParams.get('tail');

  if (!tailNumber) {
    return Response.json({ verified: false, error: 'No tail number provided' });
  }

  const clean = tailNumber.replace(/[^A-Z0-9-]/gi, '').toUpperCase();

  try {
    const response = await fetch(
      `https://registry.faa.gov/aircraft/${clean}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      return Response.json({
        verified: true,
        registrant: data.registrant?.name || 'Unknown',
        model: data.aircraft?.model || 'Unknown'
      });
    } else {
      return Response.json({ verified: false });
    }
  } catch (error) {
    return Response.json({ verified: false, error: 'Lookup failed' });
  }
}