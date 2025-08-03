"use client";

import type { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Fuel, Wrench, Calendar, Dot } from 'lucide-react';

const VehicleStatusBadge = ({ status }: { status: 'in-use' | 'maintenance' | 'available' }) => {
    const variant = {
        'in-use': 'default',
        'maintenance': 'destructive',
        'available': 'secondary',
    }[status] as 'default' | 'destructive' | 'secondary';

    const text = {
        'in-use': 'In Use',
        'maintenance': 'Maintenance',
        'available': 'Available',
    }[status];

    const color = {
        'in-use': 'bg-blue-500',
        'maintenance': 'bg-red-500',
        'available': 'bg-green-500',
    }[status];

    return (
        <Badge variant={variant} className="flex items-center gap-1">
            <Dot className={`w-4 h-4 ${color}`} />
            {text}
        </Badge>
    );
};


export default function FleetList({ vehicles }: { vehicles: Vehicle[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
                <Card key={vehicle.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-6 h-6 text-primary" />
                                    {vehicle.licensePlate}
                                </CardTitle>
                                <CardDescription>{vehicle.type}</CardDescription>
                            </div>
                            <VehicleStatusBadge status={vehicle.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel Type</span>
                            <span className="font-medium">{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Wrench className="w-4 h-4" /> Capacity</span>
                            <span className="font-medium">{vehicle.capacity} kg</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Maintenance</span>
                            <span className="font-medium">{vehicle.nextMaintenance}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled>View Details</Button>
                        <Button size="sm" disabled>Update Status</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
