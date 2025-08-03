"use client";

import { useState } from 'react';
import type { Vehicle, VehicleStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Fuel, Wrench, Calendar, Dot, Info, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const VehicleStatusBadge = ({ status }: { status: 'in-use' | 'maintenance' | 'available' }) => {
    const text = {
        'in-use': 'In Use',
        'maintenance': 'Maintenance',
        'available': 'Available',
    }[status];

    const color = {
        'in-use': 'bg-blue-500',
        'maintenance': 'bg-orange-500',
        'available': 'bg-green-500',
    }[status];

    return (
        <Badge variant="outline" className="flex items-center gap-2">
            <Dot className={`w-4 h-4 -ml-1 ${color}`} />
            {text}
        </Badge>
    );
};


export default function FleetList({ vehicles: initialVehicles }: { vehicles: Vehicle[] }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<VehicleStatus>('available');

    const handleUpdateStatus = () => {
        if (selectedVehicle) {
            setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: currentStatus } : v));
            setIsStatusModalOpen(false);
        }
    };
    
    return (
        <>
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
                            <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setIsDetailsModalOpen(true); }}>
                                <Info className="mr-2 h-4 w-4" />
                                View Details
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedVehicle(vehicle); setCurrentStatus(vehicle.status); setIsStatusModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* View Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Vehicle Details: {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedVehicle?.type}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p><strong>License Plate:</strong> {selectedVehicle?.licensePlate}</p>
                        <p><strong>Type:</strong> {selectedVehicle?.type}</p>
                        <p><strong>Fuel Type:</strong> {selectedVehicle?.fuelType}</p>
                        <p><strong>Capacity:</strong> {selectedVehicle?.capacity} kg</p>
                        <p><strong>Next Maintenance:</strong> {selectedVehicle?.nextMaintenance}</p>
                        <p><strong>Status:</strong> <VehicleStatusBadge status={selectedVehicle?.status || 'available'} /></p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Status: {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            Change the availability status for this vehicle.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="status-select">Status</Label>
                        <Select value={currentStatus} onValueChange={(value) => setCurrentStatus(value as VehicleStatus)}>
                            <SelectTrigger id="status-select">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="in-use">In Use</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateStatus}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
