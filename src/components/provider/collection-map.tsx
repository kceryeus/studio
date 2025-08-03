"use client";

import { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DUMMY_CLIENTS } from '@/lib/data';
import type { Client, GarbageStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, XCircle, Hourglass, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';

// Fix for default icon path issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const GarbageStatusIcon = ({ status, ...props }: { status: GarbageStatus } & React.ComponentProps<typeof Trash2>) => {
    switch (status) {
        case 'out':
            return <Trash2 {...props} className="text-blue-500" />;
        case 'collected':
            return <Check {...props} className="text-green-500" />;
        case 'missed':
            return <XCircle {...props} className="text-red-500" />;
        case 'not-out':
            return <BellOff {...props} className="text-gray-500" />;
        case 'pending':
        default:
            return <Hourglass {...props} className="text-yellow-500" />;
    }
};

const mapCenter: L.LatLngExpression = [34.0522, -118.2437];

export default function CollectionMap() {
    const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
    const { toast } = useToast();
    const mapRef = useRef<L.Map | null>(null);

    const updateGarbageStatus = (clientId: string, status: GarbageStatus) => {
        setClients(prevClients =>
            prevClients.map(client =>
                client.id === clientId ? { ...client, garbageStatus: status } : client
            )
        );
        toast({
            title: "Status Updated",
            description: `Client's status set to ${status}.`,
        });
    };

    const markers = useMemo(() => clients.map((client) => {
        return (
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
                            <Badge variant="outline" className="capitalize">{client.garbageStatus.replace('-', ' ')}</Badge>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs font-semibold mb-2">Update Status:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(client.id, 'collected')}>Collected</Button>
                                <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(client.id, 'missed')}>Missed</Button>
                                <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(client.id, 'not-out')}>Not Out</Button>
                                <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(client.id, 'pending')}>Pending</Button>
                            </div>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [clients]);

    return (
        <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '70vh', width: '100%' }} 
            className="rounded-lg shadow-lg"
            whenCreated={map => { mapRef.current = map; }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
        </MapContainer>
    );
}
