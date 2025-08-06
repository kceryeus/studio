
"use client";

import * as React from "react";
import Map, { Marker, Popup, NavigationControl, FullscreenControl, useControl, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { MapRef, IControl } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-directions/dist/maplibre-gl-directions.css';
import MaplibreDirections from '@maplibre/maplibre-gl-directions';


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

class DirectionsControl implements IControl {
  _directions: any;
  _map: any;
  _onRouteChanged: (e: any) => void;

  constructor(onRouteChanged: (e: any) => void) {
    this._onRouteChanged = onRouteChanged;
  }

  onAdd(map: any) {
    this._map = map;
    this._map.getCanvas().style.cursor = '';
    
    this._directions = new MaplibreDirections({
      api: 'https://routing.openstreetmap.de/routed-car/route/v1',
      profile: 'driving',
      makePostRequest: true,
      controls: {
        instructions: true,
        waypoints: true,
        profileSwitcher: false,
      },
      interactive: true,
    });
    
    this._directions.on('route', this._onRouteChanged);
    
    map.addControl(this._directions, 'top-left');
    
    const div = document.createElement('div');
    return div;
  }

  onRemove() {
    if (this._directions) {
      this._directions.off('route', this._onRouteChanged);
      if (this._map) {
          const controlContainer = this._directions.container;
          if (controlContainer && controlContainer.parentNode) {
              controlContainer.parentNode.removeChild(controlContainer);
          }
      }
    }
    this._map = null;
    this._directions = null;
  }

  setWaypoints(waypoints: [number, number][]) {
    if (this._directions) {
      this._directions.setWaypoints(waypoints);
    }
  }

  getDirections() {
      return this._directions;
  }
}

function Directions({ onRouteChanged, route }: { onRouteChanged: (e: any) => void, route: Route | null }) {
  const directionsControl = React.useMemo(() => new DirectionsControl(onRouteChanged), [onRouteChanged]);

  useControl(() => directionsControl, {position: 'top-left'});
  
  React.useEffect(() => {
    const directions = directionsControl.getDirections();
    if (directions) {
       if (route && route.path && route.path.length >= 2) {
          const waypoints = route.path.map(p => [p.lng, p.lat]);
          directionsControl.setWaypoints(waypoints);
       } else if (!route) {
          directionsControl.setWaypoints([]);
       }
    }
  }, [route, directionsControl]);

  return null;
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
  const [clientData, setClientData] = React.useState<Client[]>(clients);
  const [dialogClient, setDialogClient] = React.useState<Client | null>(null);
  const [popupInfo, setPopupInfo] = React.useState<Client | null>(null);
  const mapRef = React.useRef<MapRef>(null);

  const { toast } = useToast();
  const { t } = useLanguage();
  
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
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <Directions onRouteChanged={onRouteChanged} route={route} />

        {clientData.map((client) => (
          <Marker
            key={client.id}
            longitude={client.coordinates.lng}
            latitude={client.coordinates.lat}
            onClick={(e: MapLayerMouseEvent) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(client);
            }}
            anchor="bottom"
          >
             <MapPin className="text-primary w-8 h-8 cursor-pointer drop-shadow-lg" />
          </Marker>
        ))}

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
