"use client";

import { useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DUMMY_CLIENTS } from "@/lib/data";
import type { Client, GarbageStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Check,
  XCircle,
  Hourglass,
  BellOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Fix Leaflet default icon path
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const mapCenter: L.LatLngExpression = [34.0522, -118.2437];

export default function CollectionMap() {
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [dialogClient, setDialogClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);

  const updateGarbageStatus = (clientId: string, status: GarbageStatus) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId
          ? { ...client, garbageStatus: status }
          : client
      )
    );
    toast({
      title: "Status Updated",
      description: `Client's status set to ${status}.`,
    });
    setDialogClient(null);
  };

  const markers = useMemo(() => {
    return clients.map((client) => (
      <Marker
        key={client.id}
        position={[client.coordinates.lat, client.coordinates.lng]}
      >
        <Popup>
          <div className="p-2 w-64 space-y-2">
            <h3 className="font-bold text-lg">{client.name}</h3>
            <p className="text-sm text-muted-foreground">{client.address}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge variant="outline" className="capitalize">
                {client.garbageStatus.replace("-", " ")}
              </Badge>
              <GarbageStatusIcon status={client.garbageStatus} />
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogClient(client)}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }, [clients]);

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "70vh", width: "100%" }}
        className="rounded-lg shadow-lg"
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>

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
    </>
  );
}
