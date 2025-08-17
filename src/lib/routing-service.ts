export interface RouteSegment {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat] pairs
  };
}

export interface RoutingResponse {
  features: Array<{
    properties: {
      segments: RouteSegment[];
      summary: {
        distance: number;
        duration: number;
      };
    };
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

// Flattened routing data structure for Firestore compatibility
export interface FlattenedRoutingData {
  segmentCoordinates: string[]; // JSON stringified array of coordinate arrays
  segmentDistances: number[]; // Array of distances in meters
  segmentDurations: number[]; // Array of durations in seconds
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  lastCalculated: any; // Timestamp
}

// OpenRouteService configuration
const OPENROUTE_API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY || process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf6248e4c8c1c8c0c94c0c8c0c94c0c8c0c94c0c8c0c8c'; // Default demo key
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

export class RoutingService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Use our local API route to avoid CORS issues
    const url = '/api/routing';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          profile: endpoint,
          coordinates: options.body ? JSON.parse(options.body as string).coordinates : [],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Routing API error:', response.status, errorText);
        throw new Error(`Routing API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Network error in makeRequest:', error);
      throw error;
    }
  }

  /**
   * Get route between multiple points following actual streets
   */
  static async getRoute(
    points: RoutePoint[],
    profile: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking' = 'driving-car'
  ): Promise<RoutingResponse> {
    if (points.length < 2) {
      throw new Error('At least 2 points are required for routing');
    }

    // Convert points to the format expected by OpenRouteService
    const coordinates = points.map(point => [point.lng, point.lat]);

    const body = {
      coordinates,
      profile,
      format: 'geojson',
      instructions: false,
      preference: 'fastest',
      units: 'm', // Changed from 'meters' to 'm' as required by OpenRouteService API
      geometry: true,
      elevation: false,
      continue_straight: false,
    };

    try {
      console.log('Requesting street-based route for', points.length, 'points');
      const response = await this.makeRequest(profile, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      console.log('Street routing successful:', response);
      
      // Convert the OpenRouteService response to our internal format
      const convertedResponse = this.convertOpenRouteResponse(response);
      console.log('Converted response:', convertedResponse);
      
      return convertedResponse;
    } catch (error) {
      console.error('Street routing failed, using fallback:', error);
      
      // Only use fallback if we have a real API error, not if it's a demo key limitation
      if (OPENROUTE_API_KEY === '5b3ce3597851110001cf6248e4c8c1c8c0c94c0c8c0c94c0c8c0c94c0c8c0c8c') {
        console.warn('Using demo API key - street routing may be limited. Set OPENROUTE_API_KEY environment variable for full functionality.');
      }

      // Fallback: return straight-line route if API fails
      return this.getFallbackRoute(points);
    }
  }

  /**
   * Get route between two points
   */
  static async getRouteBetweenTwoPoints(
    start: RoutePoint,
    end: RoutePoint,
    profile: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking' = 'driving-car'
  ): Promise<RoutingResponse> {
    return this.getRoute([start, end], profile);
  }

  /**
   * Fallback method that returns straight-line routes when API is unavailable
   */
  private static getFallbackRoute(points: RoutePoint[]): RoutingResponse {
    let totalDistance = 0;
    let totalDuration = 0;
    const segments: RouteSegment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      // Calculate straight-line distance using Haversine formula
      const distance = this.calculateHaversineDistance(start, end);
      const duration = distance / 13.89; // Assume 50 km/h average speed (13.89 m/s)

      totalDistance += distance;
      totalDuration += duration;

      segments.push({
        distance,
        duration,
        geometry: {
          coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
        }
      });
    }

    return {
      features: [{
        properties: {
          segments,
          summary: {
            distance: totalDistance,
            duration: totalDuration
          }
        },
        geometry: {
          coordinates: points.map(p => [p.lng, p.lat])
        }
      }]
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateHaversineDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get optimized route (TSP-like optimization for multiple points)
   */
  static async getOptimizedRoute(
    points: RoutePoint[],
    profile: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking' = 'driving-car'
  ): Promise<RoutingResponse> {
    if (points.length <= 2) {
      return this.getRoute(points, profile);
    }

    // For now, use the order provided by the user
    // In the future, we could implement TSP optimization here
    return this.getRoute(points, profile);
  }

  /**
   * Calculate route metrics from routing response
   */
  static calculateRouteMetrics(response: RoutingResponse): {
    totalDistance: number;
    totalDuration: number;
    segments: RouteSegment[];
  } {
    if (!response.features || response.features.length === 0) {
      return { totalDistance: 0, totalDuration: 0, segments: [] };
    }

    const feature = response.features[0];
    const totalDistance = feature.properties.summary.distance;
    const totalDuration = feature.properties.summary.duration;
    const segments = feature.properties.segments || [];

    return {
      totalDistance,
      totalDuration,
      segments
    };
  }

  /**
   * Convert routing response to flattened format for Firestore storage
   */
  static flattenRoutingData(response: RoutingResponse): FlattenedRoutingData {
    const metrics = this.calculateRouteMetrics(response);

    // Flatten the segments data for Firestore compatibility
    const segmentCoordinates = metrics.segments.map(segment =>
      JSON.stringify(segment.geometry.coordinates)
    );
    const segmentDistances = metrics.segments.map(segment => segment.distance);
    const segmentDurations = metrics.segments.map(segment => segment.duration);

    return {
      segmentCoordinates,
      segmentDistances,
      segmentDurations,
      totalDistance: metrics.totalDistance,
      totalDuration: metrics.totalDuration,
      lastCalculated: new Date()
    };
  }

  /**
   * Decode Google-style polyline encoding to coordinates
   */
  private static decodePolyline(encoded: string): [number, number][] {
    const coordinates: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  }

  /**
   * Convert OpenRouteService API response to our internal format
   */
  static convertOpenRouteResponse(apiResponse: any): RoutingResponse {
    console.log('Converting OpenRouteService response:', JSON.stringify(apiResponse, null, 2));
    
    if (!apiResponse.routes || apiResponse.routes.length === 0) {
      throw new Error('No routes in API response');
    }

    const route = apiResponse.routes[0];
    console.log('First route structure:', {
      hasSegments: !!route.segments,
      segmentCount: route.segments?.length || 0,
      hasGeometry: !!route.geometry,
      geometryType: route.geometry?.type,
      geometryEncoded: typeof route.geometry === 'string',
      coordinateCount: route.geometry?.coordinates?.length || 0,
      hasSummary: !!route.summary,
      summaryKeys: route.summary ? Object.keys(route.summary) : []
    });
    
    const segments: RouteSegment[] = [];
    
    // Extract segments from the route
    if (route.segments && route.segments.length > 0) {
      for (const segment of route.segments) {
        segments.push({
          distance: segment.distance || 0,
          duration: segment.duration || 0,
          geometry: {
            coordinates: segment.steps ? 
              segment.steps.flatMap((step: any) => step.way_points || []) :
              segment.geometry?.coordinates || []
          }
        });
      }
    } else if (route.geometry) {
      // Handle encoded polyline geometry (Google-style encoding)
      let coordinates: [number, number][] = [];
      
      if (typeof route.geometry === 'string') {
        // Decode the encoded polyline
        coordinates = this.decodePolyline(route.geometry);
        console.log('Decoded polyline coordinates:', coordinates.length);
      } else if (route.geometry.coordinates) {
        coordinates = route.geometry.coordinates;
      }

      if (coordinates.length > 0) {
        // Create segments based on way points if available
        if (route.way_points && route.way_points.length >= 2) {
          for (let i = 0; i < route.way_points.length - 1; i++) {
            const startIndex = route.way_points[i];
            const endIndex = route.way_points[i + 1];
            
            const segmentCoordinates = coordinates.slice(startIndex, endIndex + 1);
            
            // Calculate segment distance and duration proportionally
            const totalDistance = route.summary?.distance || 0;
            const totalDuration = route.summary?.duration || 0;
            const segmentRatio = segmentCoordinates.length / coordinates.length;
            
            segments.push({
              distance: totalDistance * segmentRatio,
              duration: totalDuration * segmentRatio,
              geometry: { coordinates: segmentCoordinates }
            });
          }
        } else {
          // Single segment with all coordinates
          segments.push({
            distance: route.summary?.distance || 0,
            duration: route.summary?.duration || 0,
            geometry: { coordinates }
          });
        }
      }
    }

    console.log('Converted segments:', segments);

    return {
      features: [{
        properties: {
          segments,
          summary: {
            distance: route.summary?.distance || 0,
            duration: route.summary?.duration || 0
          }
        },
        geometry: {
          coordinates: segments.length > 0 ? segments[0].geometry.coordinates : []
        }
      }]
    };
  }

  /**
   * Reconstruct route segments from flattened data
   */
  static reconstructRouteSegments(flattenedData: FlattenedRoutingData): RouteSegment[] {
    console.log('Reconstructing route segments from:', flattenedData);
    const segments: RouteSegment[] = [];

    for (let i = 0; i < flattenedData.segmentCoordinates.length; i++) {
      try {
        const coordinates = JSON.parse(flattenedData.segmentCoordinates[i]) as [number, number][];
        console.log(`Segment ${i}: Parsed ${coordinates.length} coordinates:`, coordinates.slice(0, 3));
        segments.push({
          distance: flattenedData.segmentDistances[i] || 0,
          duration: flattenedData.segmentDurations[i] || 0,
          geometry: { coordinates }
        });
      } catch (error) {
        console.error('Error parsing segment coordinates:', error);
      }
    }

    console.log('Reconstructed segments:', segments);
    return segments;
  }
}
