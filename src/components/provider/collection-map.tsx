"use client";

import { useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { DUMMY_CLIENTS } from '@/lib/data';
import type { Client, GarbageStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, XCircle, Hourglass, Snooze } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GarbageStatusIcon = ({ status, ...props }: { status: GarbageStatus } & React.ComponentProps<typeof Trash2>) => {
    switch (status) {
        case 'out':
            return <Trash2 {...props} className="text-blue-500" />;
        case 'collected':
            return <Check {...props} className="text-green-500" />;
        case 'missed':
            return <XCircle {...props} className="text-red-500" />;
        case 'not-out':
            return <Snooze {...props} className="text-gray-500" />;
        case 'pending':
        default:
            return <Hourglass {...props} className="text-yellow-500" />;
    }
};

const mapCenter = { lat: 34.0522, lng: -118.2437 };

export default function CollectionMap({ apiKey }: { apiKey: string }) {
    const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const { toast } = useToast();

    const updateGarbageStatus = (clientId: string, status: GarbageStatus) => {
        setClients(prevClients =>
            prevClients.map(client =>
                client.id === clientId ? { ...client, garbageStatus: status } : client
            )
        );
        toast({
            title: "Status Updated",
            description: `Client ${clientId} status set to ${status}.`,
        });
        setSelectedClient(null);
    };

    const markers = useMemo(() => clients.map((client) => {
        const pinColor = {
            'out': { background: '#3b82f6', glyphColor: '#ffffff', borderColor: '#1d4ed8'},
            'collected': { background: '#22c55e', glyphColor: '#ffffff', borderColor: '#15803d'},
            'missed': { background: '#ef4444', glyphColor: '#ffffff', borderColor: '#b91c1c'},
            'not-out': { background: '#6b7280', glyphColor: '#ffffff', borderColor: '#4b5563'},
            'pending': { background: '#eab308', glyphColor: '#000000', borderColor: '#a16207'},
        }[client.garbageStatus];
        
        return (
            <AdvancedMarker
                key={client.id}
                position={client.coordinates}
                onClick={() => setSelectedClient(client)}
            >
                <Pin {...pinColor}>
                    <GarbageStatusIcon status={client.garbageStatus} />
                </Pin>
            </AdvancedMarker>
        );
    }), [clients]);

    return (
        <APIProvider apiKey={apiKey}>
            <div style={{ height: '70vh', width: '100%', borderRadius: 'var(--radius)' }} className="overflow-hidden shadow-lg">
                <Map
                    defaultCenter={mapCenter}
                    defaultZoom={13}
                    mapId="ecocollect-map"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                >
                    {markers}

                    {selectedClient && (
                        <InfoWindow
                            position={selectedClient.coordinates}
                            onCloseClick={() => setSelectedClient(null)}
                        >
                            <div className="p-2 w-64 space-y-2">
                                <h3 className="font-bold text-lg">{selectedClient.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedClient.address}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Status:</span>
                                  <Badge variant="outline" className="capitalize">{selectedClient.garbageStatus.replace('-', ' ')}</Badge>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs font-semibold mb-2">Update Status:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(selectedClient.id, 'collected')}>Collected</Button>
                                        <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(selectedClient.id, 'missed')}>Missed</Button>
                                        <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(selectedClient.id, 'not-out')}>Not Out</Button>
                                        <Button size="sm" variant="outline" onClick={() => updateGarbageStatus(selectedClient.id, 'pending')}>Pending</Button>
                                    </div>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}
