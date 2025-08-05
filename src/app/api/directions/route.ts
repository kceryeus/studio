
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { points } = await request.json();

  if (!points || points.length < 2) {
    return NextResponse.json({ error: 'At least two points are required' }, { status: 400 });
  }

  const apiKey = process.env.MAPTILER_API_KEY;
  if (!apiKey) {
    console.error("MAPTILER_API_KEY is not set in environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const coordinates = points.map((p: { lng: number; lat: number; }) => `${p.lng},${p.lat}`).join(';');
  const url = `https://api.maptiler.com/directions/driving/${coordinates}?key=${apiKey}&geometries=geojson&overview=full`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.routes && data.routes.length > 0) {
      const routeGeometry = data.routes[0].geometry.coordinates;
      const path = routeGeometry.map((coord: [number, number]) => ({ lng: coord[0], lat: coord[1] }));
      return NextResponse.json({ path });
    } else {
      console.error('MapTiler API Error:', data);
      return NextResponse.json({ error: 'Failed to retrieve route from MapTiler API', details: data }, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
