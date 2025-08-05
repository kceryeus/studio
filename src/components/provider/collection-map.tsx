
"use client";

import * as React from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, LayerProps, MapLayerMouseEvent } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';

import type { Client, GarbageStatus, Route } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Check,
  XCircle,
  Hourglass,
  BellOff,
  MapPin,
  UserCircle,
  MoveUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=xQ1eFBidgVoYA8BIrNEu`;

const mozambiqueBounds: [[number, number], [number, number]] = [
  [30.2, -26.8], // Southwest coordinates
  [40.9, -10.4]  // Northeast coordinates
];

const GarbageStatusIcon = ({
  status,
  ...props
}: { status: GarbageStatus } & React.ComponentProps<typeof Trash2>) => {
  const { t } = useLanguage();
  const iconProps = { ...props, "aria-label": t(status) };
  switch (status) {
    case "out":
      return <Trash2 {...iconProps} className="text-blue-500" />;
    case "collected":
      return <Check {...iconProps} className="text-green-500" />;
    case "missed":
      return <XCircle {...iconProps} className="text-red-500" />;
    case "not-out":
      return <BellOff {...iconProps} className="text-gray-500" />;
    case "pending":
    default:
      return <Hourglass {...iconProps} className="text-yellow-500" />;
  }
};

const routeLayer: LayerProps = {
  id: 'route-line',
  type: 'line',
  source: 'route',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#468499',
    'line-width': 4,
    'line-opacity': 0.8
  },
};

const newRouteLayer: LayerProps = {
    ...routeLayer,
    id: 'new-route-line',
    paint: {
        'line-color': '#D4AF37', // Accent color
        'line-width': 5,
        'line-dasharray': [2, 2],
    }
}

export default function CollectionMap({ 
    clients, 
    route, 
    userLocation,
    isDrawing,
    newRoutePoints,
    onMapClick,
    onMarkerClick,
}: { 
    clients: Client[], 
    route: Route | null, 
    userLocation: [number, number] | null,
    isDrawing: boolean;
    newRoutePoints: { lat: number; lng: number }[];
    onMapClick: (coords: { lat: number; lng: number }) => void;
    onMarkerClick: (index: number) => void;
}) {
  const [clientData, setClientData] = React.useState<Client[]>(clients);
  const [dialogClient, setDialogClient] = React.useState<Client | null>(null);
  const [popupInfo, setPopupInfo] = React.useState<Client | null>(null);
  const mapRef = React.useRef<MapRef>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  const routeGeoJSON = React.useMemo(() => {
    if (!route || !route.path || route.path.length < 2) return null;
    return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: route.path.map(p => [p.lng, p.lat])
        }
    }
  }, [route]);

  const newRouteGeoJSON = React.useMemo(() => {
    if (!isDrawing || newRoutePoints.length < 2) return null;
    return {
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: newRoutePoints.map(p => [p.lng, p.lat])
        }
    }
  }, [isDrawing, newRoutePoints]);


  React.useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 14 });
    }
  }, [userLocation]);

  const handleInternalMapClick = (event: MapLayerMouseEvent) => {
    if (isDrawing) {
      onMapClick(event.lngLat);
    }
  };

  const updateGarbageStatus = (clientId: string, status: GarbageStatus) => {
    setClientData((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId ? { ...client, garbageStatus: status } : client
      )
    );
    toast({
      title: t('status_updated'),
      description: `${t('client_status_set_to')} ${t(status)}.`,
    });
    setDialogClient(null);
  };
  
  return (
    <div className="h-full w-full relative rounded-lg shadow-md overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 32.583,
          latitude: -25.965,
          zoom: 12,
        }}
        mapStyle={MAPTILER_STYLE_URL}
        style={{width: '100%', height: '100%'}}
        maxBounds={mozambiqueBounds}
        mapLib={import('maplibre-gl')}
        onClick={handleInternalMapClick}
        cursor={isDrawing ? 'crosshair' : 'grab'}
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />

        {clientData.map((client) => (
          <Marker
            key={client.id}
            longitude={client.coordinates.lng}
            latitude={client.coordinates.lat}
            onClick={(e) => {
              if (!isDrawing) {
                e.originalEvent.stopPropagation();
                setPopupInfo(client);
              }
            }}
            anchor="bottom"
          >
             <MapPin className="text-primary w-8 h-8 cursor-pointer drop-shadow-lg" />
          </Marker>
        ))}

        {userLocation && (
            <Marker longitude={userLocation[1]} latitude={userLocation[0]}>
                <UserCircle className="w-8 h-8 text-blue-500 animate-pulse drop-shadow-lg" />
            </Marker>
        )}

        {/* Markers for new route being drawn */}
        {isDrawing && newRoutePoints.map((point, index) => (
            <Marker
                key={`new-point-${index}`}
                longitude={point.lng}
                latitude={point.lat}
                onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    onMarkerClick(index);
                }}
            >
                <div className="bg-accent rounded-full p-1 shadow-lg border-2 border-white">
                    <MoveUpRight className="w-4 h-4 text-accent-foreground" />
                </div>
            </Marker>
        ))}

        {routeGeoJSON && (
            <Source id="route-source" type="geojson" data={routeGeoJSON}>
                <Layer {...routeLayer} />
            </Source>
        )}

        {newRouteGeoJSON && (
            <Source id="new-route-source" type="geojson" data={newRouteGeoJSON}>
                <Layer {...{...routeLayer, id: 'new-route-line', paint: {...routeLayer.paint, 'line-color': '#D4AF37'}}} />
            </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            onClose={() => setPopupInfo(null)}
            anchor="top"
            closeButton={false}
            className="w-64"
          >
            <div className="p-1 space-y-2">
                <h3 className="font-bold text-base">{popupInfo.name}</h3>
                <p className="text-xs text-muted-foreground">{popupInfo.address}</p>
                <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{t('status')}:</span>
                <Badge variant="outline" className="capitalize text-xs">
                    <GarbageStatusIcon status={popupInfo.garbageStatus} className="w-3 h-3 mr-1" />
                    {t(popupInfo.garbageStatus).replace("-", " ")}
                </Badge>
                </div>
                <div className="pt-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                        setDialogClient(popupInfo);
                        setPopupInfo(null);
                    }}
                >
                    {t('update_status')}
                </Button>
                </div>
            </div>
          </Popup>
        )}
      </Map>

      <Dialog open={!!dialogClient} onOpenChange={() => setDialogClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('update_status_for', { name: dialogClient?.name })}</DialogTitle>
            <DialogDescription>
              {t('update_status_desc_1')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {(['collected', 'missed', 'not-out', 'pending'] as GarbageStatus[]).map(status => (
                 <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                        dialogClient &&
                        updateGarbageStatus(dialogClient.id, status)
                    }
                    >
                    {t(status)}
                </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
