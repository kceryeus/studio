import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-directions/dist/maplibre-gl-directions.css';
import MapLibreGLDirections from '@maplibre/maplibre-gl-directions';

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    const directions = new MapLibreGLDirections(maplibregl, {
      controls: {
        inputs: true,
        instructions: true,
        profileSwitcher: true,
      },
      flyToMode: 'none',
      language: 'en',
    });

    map.addControl(directions, 'top-left');

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;
