"use client";

import * as React from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import type { MapRef } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';

import type { Client } from "@/lib/types";
import { MapPin } from "lucide-react";

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=xQ1eFBidgVoYA8BIrNEu`;

export default function CollectionMap({
  clients
}: {
  clients: Client[]
}) {
  const mapRef = React.useRef<MapRef>(null);

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
