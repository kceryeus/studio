"use client";

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';

import type { Client, Route, RoutePoint } from "@/lib/types";
import { RouteSegment } from '@/lib/routing-service';
import { MapPin, Users, Route as RouteIcon, PlusCircle, Navigation, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance, formatDuration } from "@/lib/utils";

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=xQ1eFBidgVoYA8BIrNEu`;
const FALLBACK_STYLE_URL = `https://api.maptiler.com/maps/basic/style.json?key=xQ1eFBidgVoYA8BIrNEu`;

interface CollectionMapProps {
  clients: Client[];
  routes: Route[];
  onAddRoutePoint?: (coordinates: { lat: number; lng: number }, routeId?: string) => void;
  onUpdateRoutePoint?: (routeId: string, pointId: string, coordinates: { lat: number; lng: number }) => void;
  onDeleteRoutePoint?: (routeId: string, pointId: string) => void;
}

export default function CollectionMap({ 
  clients, 
  routes, 
  onAddRoutePoint,
  onUpdateRoutePoint,
  onDeleteRoutePoint
}: CollectionMapProps) {
  const mapRef = React.useRef<MapRef>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showClients, setShowClients] = useState(true);
  const [mapStyleError, setMapStyleError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [editMode, setEditMode] = useState<'none' | 'add' | 'edit'>('none');
  const [selectedPointForEdit, setSelectedPointForEdit] = useState<{routeId: string, pointId: string} | null>(null);
  const [selectedRouteForAdd, setSelectedRouteForAdd] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>('unknown');

  const initialViewState = {
    longitude: userLocation?.lng || 32.583,
    latitude: userLocation?.lat || -25.96,
    zoom: 12,
  };

  // Filter clients with coordinates
  const clientsWithCoordinates = useMemo(() => 
    clients.filter(client => client.coordinates), 
    [clients]
  );

  // Check location permission on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await checkLocationPermission();
      } catch (error) {
        console.error('Error checking permissions:', error);
        setLocationPermissionStatus('error');
      }
    };
    checkPermissions();
  }, []);

  // Filter active routes
  const activeRoutes = useMemo(() => {
    const filtered = routes.filter(route => route.isActive);
    console.log('Active routes:', filtered.map(r => ({ id: r.id, name: r.name, color: r.color })));
    return filtered;
  }, [routes]);

  // Clear invalid route selection when routes change
  useEffect(() => {
    if (selectedRouteForAdd && activeRoutes && !activeRoutes.find(r => r.id === selectedRouteForAdd)) {
      console.log('🚫 Clearing invalid selectedRouteForAdd:', selectedRouteForAdd);
      setSelectedRouteForAdd(null);
    }
  }, [activeRoutes, selectedRouteForAdd]);

  // Generate route line data for visualization using street-based routing when available
  const routeLines = useMemo(() => {
    if (!activeRoutes || activeRoutes.length === 0) {
      return [];
    }

    console.log('Generating route lines for', activeRoutes.length, 'active routes');

    const lines = activeRoutes.map(route => {
      if (!route.points || route.points.length < 2) {
        console.log(`Route ${route.name}: Skipping - insufficient points (${route.points?.length || 0})`);
        return null;
      }

      console.log(`Route ${route.name}: Processing route:`, {
        id: route.id,
        points: route.points?.length || 0,
        hasRoutingData: !!route.routingData,
        routingDataKeys: route.routingData ? Object.keys(route.routingData) : [],
        totalDistance: route.totalDistance,
        estimatedDuration: route.estimatedDuration
      });

      let coordinates: [number, number][];
      let hasStreetRouting = false;
      let routingQuality = 'unknown';
      
      // Use street-based routing data if available, otherwise fall back to straight lines
      if (route.routingData && route.routingData.segmentCoordinates && route.routingData.segmentCoordinates.length > 0) {
        console.log(`Route ${route.name}: Has routing data:`, {
          segmentCount: route.routingData.segmentCoordinates.length,
          totalDistance: route.routingData.totalDistance,
          totalDuration: route.routingData.totalDuration,
          hasDistances: !!route.routingData.segmentDistances,
          hasDurations: !!route.routingData.segmentDurations
        });
        
        // Reconstruct segments from flattened data
        try {
          console.log(`Route ${route.name}: Attempting to reconstruct from routing data:`, {
            segmentCount: route.routingData.segmentCoordinates.length,
            hasDistances: !!route.routingData.segmentDistances,
            hasDurations: !!route.routingData.segmentDurations
          });
          
          const segments = (() => {
            const { RoutingService } = require('@/lib/routing-service');
            return RoutingService.reconstructRouteSegments(route.routingData);
          })();
          
          console.log(`Route ${route.name}: Reconstructed segments:`, segments);
          
          if (segments && segments.length > 0) {
            // Flatten all coordinates from segments
            coordinates = segments.flatMap((segment: any) => segment.geometry.coordinates);

            // Remove duplicates that might occur at segment boundaries
            coordinates = coordinates.filter((coord, index) =>
              index === 0 ||
              coord[0] !== coordinates[index - 1][0] ||
              coord[1] !== coordinates[index - 1][1]
            );

            console.log(`Route ${route.name}: Using street routing with ${segments.length} segments, ${coordinates.length} total coordinates`);
            console.log(`Route ${route.name}: First few coordinates:`, coordinates.slice(0, 3));

            hasStreetRouting = true;
            routingQuality = 'street-following';
          } else {
            throw new Error('No valid segments found');
          }
        } catch (error) {
          console.error('Error reconstructing route segments:', error);
          
          // Try to manually create a street route from the raw data
          try {
            console.log(`Route ${route.name}: Attempting manual reconstruction...`);
            const rawCoordinates: [number, number][] = [];
            
            for (const coordString of route.routingData.segmentCoordinates) {
              try {
                const parsed = JSON.parse(coordString);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  rawCoordinates.push(...parsed);
                }
              } catch (e) {
                console.error('Failed to parse coordinate string:', e);
              }
            }
            
            if (rawCoordinates.length > 0) {
              console.log(`Route ${route.name}: Manual reconstruction successful with ${rawCoordinates.length} coordinates`);
              coordinates = rawCoordinates;
              hasStreetRouting = true;
              routingQuality = 'street-following-manual';
            } else {
              throw new Error('Manual reconstruction failed');
            }
          } catch (manualError) {
            console.error('Manual reconstruction also failed:', manualError);
            // Fallback to straight lines
            coordinates = route.points
              .sort((a, b) => a.order - b.order)
              .map(point => [point.coordinates.lng, point.coordinates.lat]);
            hasStreetRouting = false;
            routingQuality = 'straight-line-fallback';
            console.log(`Route ${route.name}: Fallback to straight lines due to reconstruction error`);
          }
        }
      } else {
        // Fallback to straight lines between points
        coordinates = route.points
          .sort((a, b) => a.order - b.order)
          .map(point => [point.coordinates.lng, point.coordinates.lat]);
        hasStreetRouting = false;
        routingQuality = 'straight-line';
        console.log(`Route ${route.name}: No routing data available, using straight lines with ${coordinates.length} points`);
      }

      const line = {
        id: route.id,
        type: 'Feature' as const,
        properties: { 
          color: route.color || '#3B82F6',
          name: route.name,
          distance: route.totalDistance,
          duration: route.estimatedDuration,
          hasStreetRouting,
          routingQuality
        },
        geometry: {
          type: 'LineString' as const,
          coordinates
        }
      };

      console.log(`Route ${route.name}: Generated line with ${coordinates.length} coordinates, street routing: ${hasStreetRouting}`);
      console.log(`Route ${route.name}: Final coordinates for map:`, coordinates.slice(0, 5));
      console.log(`Route ${route.name}: All route points:`, route.points?.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng, order: p.order })));
      console.log(`Route ${route.name}: Line object:`, line);
      return line;
    }).filter((line): line is NonNullable<typeof line> => line !== null);
    
    console.log('Generated', lines.length, 'route lines total');
    return lines;
  }, [activeRoutes]);

  // Update map sources when route lines change
  useEffect(() => {
    if (!mapRef.current || !routeLines || routeLines.length === 0) return;

    console.log('Route update effect triggered with', routeLines.length, 'routes');

    const updateRoutes = () => {
      const map = mapRef.current?.getMap();
      if (!map || !map.isStyleLoaded()) {
        // If map isn't ready, try again in a bit
        console.log('Map not ready, retrying in 100ms...');
        setTimeout(updateRoutes, 100);
        return;
      }
      
                  console.log('Map is ready, updating routes...');
            
            try {
        // Get all existing route sources and layers
        const existingSources = new Set<string>();
        const existingLayers = new Set<string>();
        
        // Check what actually exists in the map
        if (map.getStyle() && map.getStyle().sources) {
          Object.keys(map.getStyle().sources).forEach(sourceId => {
            if (sourceId.startsWith('route-')) {
              existingSources.add(sourceId);
            }
          });
        }
        
        if (map.getStyle() && map.getStyle().layers) {
          map.getStyle().layers.forEach(layer => {
            if (layer.id && layer.id.startsWith('route-line-')) {
              existingLayers.add(layer.id);
            }
          });
        }
        
        // Remove existing layers first (in reverse order to avoid dependency issues)
        const layersToRemove = Array.from(existingLayers).reverse();
        layersToRemove.forEach(layerId => {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
          } catch (error) {
            console.warn(`Could not remove layer ${layerId}:`, error);
          }
        });
        
        // Remove existing sources
        existingSources.forEach(sourceId => {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (error) {
            console.warn(`Could not remove source ${sourceId}:`, error);
          }
        });
        
        // Calculate bounds for all routes to fit them in view
        let allCoordinates: [number, number][] = [];
        
        // Add new route sources and layers
        routeLines.forEach(routeLine => {
          const sourceId = `route-${routeLine.id}`;
          const layerId = `route-line-${routeLine.id}`;
          const routeColor = routeLine.properties.color || '#F97316'; // Use orange as default
          
          try {
            console.log(`Adding route ${routeLine.id} to map:`, {
              sourceId,
              layerId,
              coordinates: routeLine.geometry.coordinates.length,
              color: routeLine.properties.color,
              hasStreetRouting: routeLine.properties.hasStreetRouting
                   });
                   
                               // Check if coordinates are in valid lng/lat range
            const coords = routeLine.geometry.coordinates;
            console.log(`🔍 Raw coordinates for route ${routeLine.id}:`, coords.slice(0, 3));
            console.log(`🔍 ACTUAL coordinate values:`, coords.slice(0, 3).map(([lng, lat]) => `[${lng.toFixed(6)}, ${lat.toFixed(6)}]`));
            
            const validCoords = coords.filter(([lng, lat]) => 
              lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90 && !isNaN(lng) && !isNaN(lat)
            );
            
            console.log(`✅ Valid coordinates for route ${routeLine.id}:`, validCoords.slice(0, 3));
            console.log(`✅ ACTUAL valid values:`, validCoords.slice(0, 3).map(([lng, lat]) => `[${lng.toFixed(6)}, ${lat.toFixed(6)}]`));
            console.log(`📊 Coordinate range: lng[${Math.min(...validCoords.map(c => c[0]))}, ${Math.max(...validCoords.map(c => c[0]))}], lat[${Math.min(...validCoords.map(c => c[1]))}, ${Math.max(...validCoords.map(c => c[1]))}]`);
            
            if (validCoords.length === 0) {
              console.error(`Route ${routeLine.id} has no valid coordinates`);
              return;
            }
            
            // Add valid coordinates to the bounds calculation
            allCoordinates.push(...validCoords);
            
            // Add source
            map.addSource(sourceId, {
              type: 'geojson',
              data: {
                ...routeLine,
                geometry: {
                  ...routeLine.geometry,
                  coordinates: validCoords
                }
              }
            });

                               // Add layer with more visible styling - no beforeId to put it on top
                   map.addLayer({
                     id: layerId,
                     type: 'line',
                     source: sourceId,
                     paint: {
                       'line-color': routeColor,
                'line-width': routeLine.properties.hasStreetRouting ? 6 : 4,
                'line-opacity': 0.8,
                       'line-dasharray': routeLine.properties.hasStreetRouting ? [1, 0] : [8, 4]
                     },
                     layout: {
                       'line-cap': 'round',
                       'line-join': 'round'
                     }
                   });

                   // Add hover layer for better interaction
                   map.addLayer({
                     id: `${layerId}-hover`,
                     type: 'line',
                     source: sourceId,
                     paint: {
                       'line-color': routeColor,
                'line-width': routeLine.properties.hasStreetRouting ? 8 : 6,
                       'line-opacity': 0
                     },
                     layout: {
                       'line-cap': 'round',
                       'line-join': 'round'
                     }
                   });
            
            console.log(`Successfully added route ${routeLine.id} to map`);
          } catch (error) {
            console.error(`Error adding route ${routeLine.id}:`, error);
          }
        });
        
                // Fit map to show all routes if we have coordinates - TEMPORARILY DISABLED FOR DEBUGGING
        if (allCoordinates.length > 0) {
          console.log('🗺️ DEBUGGING: Would fit map to show', allCoordinates.length, 'route coordinates');
          
          // Calculate bounds
          const lngs = allCoordinates.map(coord => coord[0]);
          const lats = allCoordinates.map(coord => coord[1]);
          
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          
          console.log('🔍 DEBUGGING: All coordinates sample:', allCoordinates.slice(0, 5));
          console.log('🔍 DEBUGGING: Lng range:', [minLng, maxLng]);
          console.log('🔍 DEBUGGING: Lat range:', [minLat, maxLat]);
          
          // Add padding around the bounds
          const padding = 0.01; // About 1km at the equator
          const bounds = [
            [minLng - padding, minLat - padding], // Southwest
            [maxLng + padding, maxLat + padding]  // Northeast
          ] as [[number, number], [number, number]];
          
          console.log('🔍 DEBUGGING: Calculated route bounds:', bounds);
          
          // Check if bounds look reasonable (not tiny deltas near 0,0)
          const boundsWidth = maxLng - minLng;
          const boundsHeight = maxLat - minLat;
          
          if (boundsWidth > 0.001 && boundsHeight > 0.001) {
            console.log('✅ Bounds look reasonable, fitting map');
            // Fit the map to these bounds
            map.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15,
              duration: 1000
            });
          } else {
            console.log('⚠️ Bounds too small (likely coordinate issue), skipping auto-fit');
            console.log(`Bounds width: ${boundsWidth}, height: ${boundsHeight}`);
          }
        }

                       console.log('Updated map sources for', routeLines.length, 'routes');
               
      } catch (error) {
        console.error('Error updating map routes:', error);
      }
    };
    
    // Start the update process with a small delay to ensure map is ready
    setTimeout(updateRoutes, 50);
  }, [routeLines]);

  const handleClientClick = (client: Client) => {
    setSelectedClient(selectedClient?.id === client.id ? null : client);
  };

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(selectedRoute?.id === route.id ? null : route);
  };

  // Check location permission status
  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      setLocationPermissionStatus('not-supported');
      return;
    }
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermissionStatus(permission.state);
      console.log('Location permission status:', permission.state);
      
      permission.onchange = () => {
        setLocationPermissionStatus(permission.state);
        console.log('Location permission changed to:', permission.state);
      };
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermissionStatus('error');
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);
    
    console.log('🔍 Requesting geolocation permission...');
    
    // Check permission first
    checkLocationPermission();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setGettingLocation(false);
        
        console.log('✅ Current location acquired:', {
          ...newLocation,
          accuracy: accuracy ? `${Math.round(accuracy)}m` : 'Unknown',
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Validate coordinates are reasonable
        if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          setLocationError('Invalid coordinates received from GPS');
          return;
        }
        
        // Move map to current location
        if (mapRef.current) {
          mapRef.current.getMap().flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 2000
          });
        }
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unable to get current location';
        
        console.error('Geolocation error details:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toLocaleTimeString()
        });
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '🚫 Location access denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📡 Location information is unavailable. Try again or check your GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = '⏱️ Location request timed out. Please try again.';
            break;
          default:
            errorMessage = `GPS Error: ${error.message}`;
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  // Handle updating route point coordinates
  const handleUpdateRoutePoint = (routeId: string, pointId: string, newCoords: {lat: number, lng: number}) => {
    if (onUpdateRoutePoint) {
      onUpdateRoutePoint(routeId, pointId, newCoords);
      setSelectedPointForEdit(null);
      setEditMode('none');
      console.log(`Updated route point ${pointId} to:`, newCoords);
    }
  };

  // Reset route coordinates to user's local area
  const resetRoutesToLocalArea = () => {
    if (!userLocation) {
      alert('Please get your current location first by clicking "My Location"');
      return;
    }

    activeRoutes.forEach(route => {
      if (route.points && route.points.length > 0) {
        // Update each point to be near the user's location with some spread
        route.points.forEach((point, index) => {
          const spread = 0.01; // About 1km spread
          const newCoords = {
            lat: userLocation.lat + (Math.random() - 0.5) * spread,
            lng: userLocation.lng + (Math.random() - 0.5) * spread
          };
          
          if (onUpdateRoutePoint) {
            onUpdateRoutePoint(route.id, point.id, newCoords);
          }
        });
      }
    });
    
    console.log('Reset all route points to local area around:', userLocation);
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border relative touch-manipulation">
      {mapLoading && (
        <div className="absolute top-2 left-2 z-10 bg-blue-100 border border-blue-400 text-blue-800 px-3 py-1 rounded-md text-sm">
          Loading map...
        </div>
      )}
      {mapStyleError && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-md text-sm">
          Using fallback map style
        </div>
      )}
      
      {/* Routing Quality Overlay - COMMENTED OUT FOR CLEANUP */}
      {/* <div className="absolute top-12 left-2 z-10 bg-white p-3 rounded border shadow-md max-w-xs">
        <div className="font-medium mb-2 text-sm">Routing Quality:</div>
        <div className="space-y-1 text-xs">
          {activeRoutes.filter(r => r.points && r.points.length >= 2).map(route => (
            <div key={route.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${route.routingData ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium">{route.name}</span>
              <span className={`text-xs px-1 py-0.5 rounded ${route.routingData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {route.routingData ? 'Street' : 'Straight'}
              </span>
              {route.totalDistance && (
                <span className="text-xs text-gray-600">
                  {Math.round(route.totalDistance)}m
                </span>
              )}
            </div>
          ))}
        </div>
      </div> */}
      
      {/* Debug Overlay - COMMENTED OUT FOR CLEANUP */}
      {/* <div className="absolute top-12 right-2 z-10 bg-white p-3 rounded border shadow-md max-w-xs max-h-96 overflow-y-auto">
        <div className="font-medium mb-2 text-sm">Debug Info:</div>
        <div className="space-y-1 text-xs">
          <div>Active Routes: {activeRoutes.length}</div>
          <div>Route Lines: {routeLines.length}</div>
          <div>Map Ready: {!mapLoading ? 'Yes' : 'No'}</div>
          {userLocation && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <div className="font-medium">Your Location:</div>
              <div>Lat: {userLocation.lat.toFixed(6)}</div>
              <div>Lng: {userLocation.lng.toFixed(6)}</div>
            </div>
          )}
          {activeRoutes.filter(r => r.points && r.points.length > 0).map(route => (
            <div key={route.id} className="mt-2 p-2 bg-gray-50 rounded">
              <div className="font-medium">{route.name}:</div>
              <div>Points: {route.points?.length || 0}</div>
              {route.points?.slice(0, 3).map((point, idx) => (
                <div key={point.id} className="text-xs text-gray-600">
                  P{idx + 1}: {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
                </div>
              ))}
              <div>Segments: {route.routingData?.segmentCoordinates?.length || 0}</div>
              <div>Distance: {Math.round(route.totalDistance || 0)}m</div>
              <div>Duration: {Math.round(route.estimatedDuration || 0)}s</div>
            </div>
          ))}
        </div>
      </div> */}
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{width: '100%', height: '100%'}}
        mapStyle={mapStyleError ? FALLBACK_STYLE_URL : MAPTILER_STYLE_URL}
        mapLib={import('maplibre-gl')}
        cursor={editMode !== 'none' ? "crosshair" : "default"}
        onError={(e) => {
          console.error('Map error:', e);
          setMapStyleError(true);
        }}
        onStyleData={() => {
          console.log('Map style loaded successfully');
          setMapLoading(false);
        }}
        onLoad={() => {
          setMapLoading(false);
        }}
        onMouseMove={(e) => {
          if (!mapRef.current || !routeLines || routeLines.length === 0) return;
          const map = mapRef.current.getMap();
          
          // Only check for route layers if they exist
          try {
            const existingLayers = map.getStyle()?.layers?.filter(layer => 
              layer.id && layer.id.startsWith('route-line-')
            ) || [];
            
            if (existingLayers.length > 0) {
              // Check if hovering over a route line
              const features = map.queryRenderedFeatures(e.point, {
                layers: existingLayers.map(layer => layer.id!)
              });
              
              if (features.length > 0) {
                map.getCanvas().style.cursor = 'pointer';
              } else {
                map.getCanvas().style.cursor = onAddRoutePoint ? 'crosshair' : 'default';
              }
            } else {
              map.getCanvas().style.cursor = onAddRoutePoint ? 'crosshair' : 'default';
            }
          } catch (error) {
            // If there's an error, just set default cursor
            map.getCanvas().style.cursor = onAddRoutePoint ? 'crosshair' : 'default';
          }
        }}
        onMouseLeave={() => {
          if (mapRef.current) {
            mapRef.current.getMap().getCanvas().style.cursor = onAddRoutePoint ? 'crosshair' : 'default';
          }
        }}
        onClick={(e) => {
            const { lng, lat } = e.lngLat;
          
          // Validate coordinates are reasonable (not in the ocean near 0,0)
          if (Math.abs(lat) < 1 && Math.abs(lng) < 1) {
            console.warn('🌊 Coordinates too close to 0,0 (likely invalid):', { lat, lng });
            alert('⚠️ These coordinates seem invalid (too close to 0,0). Please get your location first or click somewhere more specific.');
            return;
          }
          
          if (editMode === 'add' && onAddRoutePoint && selectedRouteForAdd) {
            // Verify the route still exists before adding
            const targetRoute = activeRoutes.find(r => r.id === selectedRouteForAdd);
            if (targetRoute) {
              // Add new route point mode - add to selected route
              onAddRoutePoint({ lat, lng }, selectedRouteForAdd);
              console.log('✅ Added new route point at:', { lat: lat.toFixed(6), lng: lng.toFixed(6) }, 'to route:', selectedRouteForAdd);
            } else {
              console.warn('⚠️ Selected route no longer exists, clearing selection');
              setSelectedRouteForAdd(null);
              alert('The selected route is no longer available. Please select a route again.');
            }
          } else if (editMode === 'add' && onAddRoutePoint && !selectedRouteForAdd) {
            // Warn user to select a route first
            console.log('⚠️ No route selected for adding point');
            alert('Please select a route first from the dropdown before adding points.');
          } else if (editMode === 'edit' && selectedPointForEdit && onUpdateRoutePoint) {
            // Edit existing route point mode
            handleUpdateRoutePoint(selectedPointForEdit.routeId, selectedPointForEdit.pointId, { lat, lng });
            console.log('✅ Updated route point to:', { lat: lat.toFixed(6), lng: lng.toFixed(6) });
          } else if (editMode === 'none') {
            // Normal mode - check for route line clicks
            if (!mapRef.current || !routeLines || routeLines.length === 0) return;
            const map = mapRef.current.getMap();
            
            try {
              const existingLayers = map.getStyle()?.layers?.filter(layer => 
                layer.id && layer.id.startsWith('route-line-')
              ) || [];
              
              if (existingLayers.length > 0) {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: existingLayers.map(layer => layer.id!)
                });
                
                if (features.length > 0) {
                  const routeId = features[0].source;
                  const route = activeRoutes.find(r => `route-${r.id}` === routeId);
                  if (route) {
                    handleRouteClick(route);
                  }
                }
              }
            } catch (error) {
              // If there's an error, just ignore the click
              console.warn('Error checking route click:', error);
            }
          }
        }}
      >
        {/* Route Lines - Now handled dynamically via useEffect */}
        {/* Route lines are updated automatically when routing data changes */}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
              <div className="text-xs bg-blue-500 text-white px-1 md:px-2 py-0.5 md:py-1 rounded mt-1 shadow-lg whitespace-nowrap">
                <span className="hidden md:inline">Your Location</span>
                <span className="md:hidden">You</span>
              </div>
            </div>
          </Marker>
        )}

        {/* Client Markers */}
        {showClients && clientsWithCoordinates.map(client => (
          <Marker
            key={client.id}
            longitude={client.coordinates!.lng}
            latitude={client.coordinates!.lat}
            anchor="bottom"
          >
                          <div 
                className="cursor-pointer flex flex-col items-center touch-manipulation"
                onClick={() => handleClientClick(client)}
              >
              <MapPin className={`w-6 h-6 md:w-8 md:h-8 drop-shadow-lg ${
                selectedClient?.id === client.id ? 'text-blue-600' : 'text-primary'
              }`} />
              {selectedClient?.id === client.id && (
                <div className="absolute bottom-full mb-2 w-56 md:w-64 bg-white rounded-lg shadow-lg border p-2 md:p-3 z-10 max-w-[calc(100vw-2rem)]">
                  <div className="space-y-1 md:space-y-2">
                    <div className="font-medium text-sm md:text-base truncate">{client.name}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{client.phone}</div>
                    <div className="flex gap-1 md:gap-2 flex-wrap">
                      <Badge variant={client.collectionStatus === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {client.collectionStatus}
                      </Badge>
                      <Badge variant={client.userId ? 'secondary' : 'outline'} className="text-xs">
                        {client.userId ? 'Synced' : 'Unlinked'}
                      </Badge>
                    </div>
                    {client.routeId && (
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        Route: {routes.find(r => r.id === client.routeId)?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Marker>
        ))}

        {/* Route Point Markers */}
        {showRoutes && activeRoutes.map(route => {
          // Ensure points is always an array
          const routePoints = Array.isArray(route.points) ? route.points : [];
          return routePoints.map((point, index) => (
            <Marker
              key={`${route.id}-${point.id}`}
              longitude={point.coordinates.lng}
              latitude={point.coordinates.lat}
              anchor="bottom"
            >
              <div 
                className="cursor-pointer flex flex-col items-center touch-manipulation"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editMode === 'none') {
                    handleRouteClick(route);
                  } else if (editMode === 'edit') {
                    setSelectedPointForEdit({ routeId: route.id, pointId: point.id });
                    console.log('Selected point for editing:', point.id);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditMode('edit');
                  setSelectedPointForEdit({ routeId: route.id, pointId: point.id });
                  console.log('Double-clicked to edit point:', point.id);
                }}
              >
                <div 
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 shadow-lg flex items-center justify-center text-xs font-bold text-white ${
                    selectedPointForEdit?.pointId === point.id ? 'border-yellow-400 animate-pulse' : 'border-white'
                  }`}
                  style={{ backgroundColor: route.color || '#3B82F6' }}
                >
                  <span className="text-xs md:text-xs">{index + 1}</span>
                </div>
                {selectedRoute?.id === route.id && (
                  <div className="absolute bottom-full mb-2 w-56 md:w-64 bg-white rounded-lg shadow-lg border p-2 md:p-3 z-10 max-w-[calc(100vw-2rem)]">
                    <div className="space-y-1 md:space-y-2">
                      <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                        <div 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: route.color || '#3B82F6' }}
                        />
                        <span className="truncate">{route.name}</span>
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Point {index + 1} of {routePoints.length}
                      </div>
                      {point.type === 'client' && point.clientId && (
                        <div className="text-xs md:text-sm truncate">
                          Client: {clients.find(c => c.id === point.clientId)?.name || 'Unknown'}
                        </div>
                      )}
                      {point.notes && (
                        <div className="text-xs md:text-sm text-muted-foreground">
                          Notes: {point.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Marker>
          ));
        })}
      </Map>

      {/* Map Controls - Responsive positioning for mobile and desktop */}
      <div className="fixed top-20 right-2 md:top-24 md:right-4 space-y-2 z-30">
        <Card className="w-48 md:w-52 bg-white/95 backdrop-blur-sm border shadow-lg max-h-[calc(100vh-6rem)] overflow-y-auto">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm">Map Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 md:space-y-2 p-2 md:p-4">
            {/* Debug console log - commented out for cleanup */}
            {/* {console.log('🗺️ Map Controls rendering...', { 
              routeLines: routeLines.length, 
              userLocation, 
              gettingLocation, 
              locationError 
            })} */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showClients}
                onChange={(e) => setShowClients(e.target.checked)}
                className="scale-75 md:scale-100"
              />
              <span className="text-xs md:text-sm">Show Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="scale-75 md:scale-100"
              />
              <span className="text-xs md:text-sm">Show Routes</span>
            </div>
            {routeLines.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 md:h-8"
                onClick={() => {
                  if (!mapRef.current) return;
                  const map = mapRef.current.getMap();
                  
                  // Calculate bounds for all routes
                  const allCoordinates: [number, number][] = [];
                  routeLines.forEach(routeLine => {
                    allCoordinates.push(...routeLine.geometry.coordinates);
                  });
                  
                  if (allCoordinates.length > 0) {
                    const lngs = allCoordinates.map(coord => coord[0]);
                    const lats = allCoordinates.map(coord => coord[1]);
                    
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);
                    
                    const padding = 0.01;
                    const bounds = [
                      [minLng - padding, minLat - padding],
                      [maxLng + padding, maxLat + padding]
                    ] as [[number, number], [number, number]];
                    
                    map.fitBounds(bounds, {
                      padding: 50,
                      maxZoom: 15,
                      duration: 1000
                    });
                  }
                }}
              >
                <Target className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                <span className="hidden md:inline">Fit Routes to View</span>
                <span className="md:hidden">Fit Routes</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 md:h-8"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
            >
              <Navigation className="w-2 h-2 md:w-3 md:h-3 mr-1" />
              <span className="hidden md:inline">{gettingLocation ? 'Getting Location...' : 'My Location'}</span>
              <span className="md:hidden">{gettingLocation ? 'GPS...' : 'GPS'}</span>
            </Button>
            {locationError && (
              <div className="text-xs text-red-600 mt-1 p-1 md:p-2 bg-red-50 rounded">
                {locationError}
              </div>
            )}
            {userLocation && (
              <div className="text-xs text-green-600 mt-1 p-1 md:p-2 bg-green-50 rounded">
                <div className="font-medium">📍 GPS Acquired</div>
                <div className="hidden md:block">Lat: {userLocation.lat.toFixed(6)}</div>
                <div className="hidden md:block">Lng: {userLocation.lng.toFixed(6)}</div>
                <div className="text-xs text-green-700 mt-1">
                  <span className="hidden md:inline">✅ You can now add route points in your area</span>
                  <span className="md:hidden">✅ Ready to add points</span>
                </div>
              </div>
            )}
            
            {!userLocation && !gettingLocation && !locationError && (
              <div className="text-xs text-yellow-600 mt-1 p-1 md:p-2 bg-yellow-50 rounded">
                <div className="font-medium">⚠️ No GPS</div>
                <div className="hidden md:block">Click "My Location" to get your coordinates</div>
                <div className="md:hidden">Click GPS button first</div>
                <div className="text-xs text-yellow-700 mt-1 hidden md:block">
                  Permission Status: {locationPermissionStatus}
                </div>
                {locationPermissionStatus === 'denied' && (
                  <div className="text-xs text-red-700 mt-1">
                    <span className="hidden md:inline">❌ Location blocked! Enable in browser settings.</span>
                    <span className="md:hidden">❌ Enable location access</span>
                  </div>
                )}
                {locationPermissionStatus === 'prompt' && (
                  <div className="text-xs text-blue-700 mt-1 hidden md:block">
                    🔄 Browser will ask for permission when you click "My Location"
                  </div>
                )}
              </div>
            )}
            
            {/* Coordinate Editing Controls */}
            <div className="border-t pt-1 md:pt-2 mt-1 md:mt-2">
              <div className="text-xs font-medium mb-1 md:mb-2">
                <span className="hidden md:inline">Edit Coordinates:</span>
                <span className="md:hidden">Edit:</span>
              </div>
              <div className="space-y-1">
                {/* Route Selection for Adding Points */}
                {activeRoutes.length > 0 && (
                  <div className="mb-1 md:mb-2">
                    <div className="text-xs mb-1 hidden md:block">Select Route to Add Points:</div>
                    <div className="text-xs mb-1 md:hidden">Route:</div>
                    <select
                      className="w-full text-xs p-1 border rounded h-6 md:h-auto"
                      value={selectedRouteForAdd || ''}
                      onChange={(e) => setSelectedRouteForAdd(e.target.value || null)}
                    >
                      <option value="">Select a route...</option>
                      {activeRoutes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({route.points?.length || 0} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant={editMode === 'add' ? 'default' : 'outline'}
                  className="w-full text-xs h-7 md:h-8"
                  onClick={() => {
                    if (editMode === 'add') {
                      setEditMode('none');
                      setSelectedRouteForAdd(null);
                    } else {
                      setEditMode('add');
                      // Auto-select first route if none selected and routes are available
                      if (!selectedRouteForAdd && activeRoutes.length > 0) {
                        setSelectedRouteForAdd(activeRoutes[0].id);
                        console.log('🎯 Auto-selected route for adding:', activeRoutes[0].name);
                      }
                    }
                    setSelectedPointForEdit(null);
                  }}
                  disabled={editMode === 'add' && !selectedRouteForAdd}
                >
                  <PlusCircle className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                  <span className="hidden md:inline">{editMode === 'add' ? 'Exit Add Mode' : 'Add Route Point'}</span>
                  <span className="md:hidden">{editMode === 'add' ? 'Exit Add' : 'Add Point'}</span>
                </Button>
                
                <Button
                  size="sm"
                  variant={editMode === 'edit' ? 'default' : 'outline'}
                  className="w-full text-xs h-7 md:h-8"
                  onClick={() => {
                    setEditMode(editMode === 'edit' ? 'none' : 'edit');
                    if (editMode === 'edit') setSelectedPointForEdit(null);
                  }}
                >
                  <MapPin className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                  <span className="hidden md:inline">{editMode === 'edit' ? 'Exit Edit Mode' : 'Edit Route Points'}</span>
                  <span className="md:hidden">{editMode === 'edit' ? 'Exit Edit' : 'Edit Points'}</span>
                </Button>
                
                {userLocation && activeRoutes.length > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full text-xs h-7 md:h-8"
                    onClick={resetRoutesToLocalArea}
                  >
                    <span className="hidden md:inline">🔄 Reset to Local Area</span>
                    <span className="md:hidden">🔄 Reset Local</span>
                  </Button>
                )}
              </div>
              
              {editMode !== 'none' && (
                <div className="text-xs text-blue-600 mt-1 md:mt-2 p-1 md:p-2 bg-blue-50 rounded">
                  {editMode === 'add' && selectedRouteForAdd && (
                    <>
                      <span className="hidden md:inline">📍 Click on map to add point to {activeRoutes.find(r => r.id === selectedRouteForAdd)?.name}</span>
                      <span className="md:hidden">📍 Tap map to add point</span>
                    </>
                  )}
                  {editMode === 'add' && !selectedRouteForAdd && (
                    <>
                      <span className="hidden md:inline">📍 Select a route first, then click on map to add points</span>
                      <span className="md:hidden">📍 Select route first</span>
                    </>
                  )}
                  {editMode === 'edit' && selectedPointForEdit && (
                    <>
                      <span className="hidden md:inline">📍 Click on map to move selected point</span>
                      <span className="md:hidden">📍 Tap map to move point</span>
                    </>
                  )}
                  {editMode === 'edit' && !selectedPointForEdit && (
                    <>
                      <span className="hidden md:inline">📍 Click a route point to select, then click map to move it</span>
                      <span className="md:hidden">📍 Tap point, then map</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Summary - Responsive positioning for mobile and desktop */}
      {activeRoutes && activeRoutes.length > 0 && (
        <div className="fixed bottom-2 left-2 md:bottom-4 md:left-4 z-20">
          <Card className="w-56 md:w-64 bg-white/95 backdrop-blur-sm border shadow-lg max-h-[calc(50vh)] overflow-y-auto">
            <CardHeader className="pb-1 md:pb-2 p-2 md:p-4">
              <CardTitle className="text-xs md:text-sm flex items-center gap-2">
                <RouteIcon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Active Routes</span>
                <span className="md:hidden">Routes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 md:space-y-2 p-2 md:p-4 pt-0">
              {activeRoutes.map(route => (
                <div key={route.id} className="flex items-center justify-between text-xs md:text-sm">
                  <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                    <div 
                      className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: route.color || '#3B82F6' }}
                    />
                    <span className="truncate">{route.name}</span>
                  </div>
                  <div className="text-muted-foreground text-xs ml-2 flex-shrink-0">
                    {Array.isArray(route.points) ? route.points.length : 0} pts
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Routing Quality Indicator - COMMENTED OUT FOR CLEANUP */}
      {/* {activeRoutes.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded border text-sm max-w-xs">
          <div className="font-medium mb-2">Routing Quality:</div>
          <div className="space-y-1 text-xs">
            {activeRoutes.map(route => {
              const routeLine = routeLines.find(line => line.id === route.id);
              const isStreetRouting = routeLine?.properties.hasStreetRouting;
              
              return (
                <div key={route.id} className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isStreetRouting ? 'bg-green-500' : 'bg-yellow-500'
                    }`} 
                  />
                  <span className="truncate">{route.name}</span>
                  <Badge 
                    variant={isStreetRouting ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {isStreetRouting ? 'Street' : 'Straight'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )} */}
    </div>
  );
}
