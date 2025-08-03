"use client";

import { useState, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, LayerProps } from "react-map-gl/maplibre";
import { DUMMY_CLIENTS } from "@/lib/data";
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
  UserCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  switch (status) {
    case "out":
      return <Trash2 {...props} className="text-blue-500" />;
    case "collected":
      return <Check {...props} className="text-green-500" />;
    case "missed":
      return <XCircle {...props} className="text-red-500" />;
    case "not-out":
      return <BellOff {...props} className="text-gray-500" />;
    case "pending":
    default:
      return <Hourglass {...props} className="text-yellow-500" />;
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
    'line-color': 'hsl(var(--primary))',
    'line-width': 4,
    'line-opacity': 0.8
  },
};

export default function CollectionMap({ selectedRoute, userLocation }: { selectedRoute: Route | null, userLocation: [number, number] | null }) {
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [dialogClient, setDialogClient] = useState<Client | null>(null);
  const [popupInfo, setPopupInfo] = useState<Client | null>(null);
  const mapRef = React.useRef<MapRef>(null);

  const { toast } = useToast();

  const clientsOnRoute = selectedRoute ? clients.filter(c => c.routeId === selectedRoute.id && c.sharesLocation) : [];

  const routeGeoJSON = selectedRoute ? {
    type: 'Feature' as const,
    properties: {},
    geometry: {
        type: 'LineString' as const,
        coordinates: clientsOnRoute.map(c => [c.coordinates.lng, c.coordinates.lat])
    }
  } : null;

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 14 });
    }
  }, [userLocation]);


  const updateGarbageStatus = (clientId: string, status: GarbageStatus) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId ? { ...client, garbageStatus: status } : client
      )
    );
    toast({
      title: "Status Updated",
      description: `Client's status set to ${status}.`,
    });
    setDialogClient(null);
  };
  
  return (
    <div className="h-[70vh] w-full relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 35.5296, // Center of Mozambique
          latitude: -18.6657, // Center of Mozambique
          zoom: 5,
        }}
        mapStyle={MAPTILER_STYLE_URL}
        style={{ borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"}}
        maxBounds={mozambiqueBounds}
        mapLib={import('maplibre-gl')}
      >
        <FullscreenControl />
        <NavigationControl />

        {clientsOnRoute.map((client) => (
          <Marker
            key={client.id}
            longitude={client.coordinates.lng}
            latitude={client.coordinates.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(client);
            }}
          >
             <MapPin className="text-primary w-8 h-8" />
          </Marker>
        ))}

        {userLocation && (
            <Marker longitude={userLocation[1]} latitude={userLocation[0]}>
                <UserCircle className="w-8 h-8 text-blue-500 animate-pulse" />
            </Marker>
        )}

        {routeGeoJSON && (
            <Source id="route-source" type="geojson" data={routeGeoJSON}>
                <Layer {...routeLayer} />
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
            <div className="p-2 space-y-2">
                <h3 className="font-bold text-lg">{popupInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{popupInfo.address}</p>
                <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <Badge variant="outline" className="capitalize">
                    {popupInfo.garbageStatus.replace("-", " ")}
                </Badge>
                <GarbageStatusIcon status={popupInfo.garbageStatus} />
                </div>
                <div className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogClient(popupInfo)}
                >
                    Update Status
                </Button>
                </div>
            </div>
          </Popup>
        )}
      </Map>

      <Dialog open={!!dialogClient} onOpenChange={() => setDialogClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change garbage status for{" "}
              <strong>{dialogClient?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                dialogClient &&
                updateGarbageStatus(dialogClient.id, "collected")
              }
            >
              Collected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                dialogClient &&
                updateGarbageStatus(dialogClient.id, "missed")
              }
            >
              Missed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                dialogClient &&
                updateGarbageStatus(dialogClient.id, "not-out")
              }
            >
              Not Out
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                dialogClient &&
                updateGarbageStatus(dialogClient.id, "pending")
              }
            >
              Pending
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
