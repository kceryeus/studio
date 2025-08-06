
"use client";

import * as React from 'react';
import Map, { Marker, useMap } from 'react-map-gl/maplibre';
import type { MapRef } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreDirections from '@maplibre/maplibre-gl-directions';

import type { Client, Route } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import { useLanguage } from '@/context/language-context';

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=xQ1eFBidgVoYA8BIrNEu`;

// Custom hook to manage the Directions control
function useDirectionsControl(mapRef: React.RefObject<MapRef>, onRouteChanged: (e: any) => void) {
    React.useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) {
            return;
        }

        const directions = new MaplibreDirections(map, {
            api: 'https://routing.openstreetmap.de/routed-car/route/v1',
            profile: 'driving',
            makePostRequest: true,
            interactive: true,
            controls: {
                instructions: false,
                inputs: true,
                profileSwitcher: false,
            },
        });
        
        map.addControl(directions, 'top-left');
        
        const routeChangeHandler = (e: any) => onRouteChanged(e);
        directions.on('route', routeChangeHandler);

        // Store the directions instance on the map so we can access it later
        (map as any).directions = directions;

        return () => {
            directions.off('route', routeChangeHandler);
            // Check if the control is still on the map before removing
            if (map && map.getControl) { // map might be unmounted
                try {
                   map.removeControl(directions);
                } catch(e) {
                   //
                }
            }
        };
    }, [mapRef, onRouteChanged]);
}


export default function CollectionMap({
  clients,
  route,
  onRouteChanged
}: {
  clients: Client[],
  route: Route | null,
  onRouteChanged: (e: any) => void
}) {
  const { t } = useLanguage();
  const mapRef = React.useRef<MapRef>(null);

  useDirectionsControl(mapRef, onRouteChanged);

  React.useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && (map as any).directions) {
        const directions = (map as any).directions as MaplibreDirections;
        if (route && route.path && route.path.length >= 2) {
            const waypoints = route.path.map(p => [p.lng, p.lat]);
            directions.setWaypoints(waypoints);
        } else {
            directions.clear();
        }
    }
  }, [route]);

  const initialViewState = {
    longitude: 32.583,
    latitude: -25.96,
    zoom: 12,
  };
  
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border relative">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{width: '100%', height: '100%'}}
        mapStyle={MAPTILER_STYLE_URL}
        mapLib={import('maplibre-gl')}
      >
        {clients.map(client => (
          <Marker
            key={client.id}
            longitude={client.coordinates.lng}
            latitude={client.coordinates.lat}
            anchor="bottom"
          >
            <div className="cursor-pointer flex flex-col items-center">
              <MapPin className="w-8 h-8 text-primary drop-shadow-lg" />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
