import { NextRequest, NextResponse } from 'next/server';

const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf6248e4c8c1c8c0c94c0c8c0c94c0c8c0c94c0c8c0c8c';
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, profile, coordinates } = body;

    console.log('Routing API request:', { endpoint, profile, coordinatesCount: coordinates?.length });

    if (!endpoint || !coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      console.error('Invalid request parameters:', body);
      return NextResponse.json(
        { error: 'Missing or invalid parameters: endpoint and coordinates array with at least 2 points required' },
        { status: 400 }
      );
    }

    // Use endpoint as the profile if profile is not provided
    const routingProfile = profile || endpoint;
    const url = `${OPENROUTE_BASE_URL}/${routingProfile}`;
    
    console.log('Calling OpenRouteService:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': OPENROUTE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates,
        format: 'geojson',
        instructions: false,
        preference: 'fastest',
        units: 'm', // Changed from 'meters' to 'm' as required by OpenRouteService API
        geometry: true,
        elevation: false,
        continue_straight: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Routing API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenRouteService response received successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Routing proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
