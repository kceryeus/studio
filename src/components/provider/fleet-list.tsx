
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
import { useLanguage } from '@/context/language-context';

const VehicleStatusBadge = ({ status }: { status: 'in-use' | 'maintenance' | 'available' }) => {
    const { t } = useLanguage();
    const text = {
        'in-use': t('in_use'),
        'maintenance': t('maintenance'),
        'available': t('available'),
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
    const { t } = useLanguage();

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
                                <span className="text-muted-foreground flex items-center gap-2"><Fuel className="w-4 h-4" /> {t('fuel_type')}</span>
                                <span className="font-medium">{vehicle.fuelType}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Wrench className="w-4 h-4" /> {t('capacity')}</span>
                                <span className="font-medium">{vehicle.capacity} kg</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('next_maintenance')}</span>
                                <span className="font-medium">{vehicle.nextMaintenance}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setIsDetailsModalOpen(true); }}>
                                <Info className="mr-2 h-4 w-4" />
                                {t('view_details')}
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedVehicle(vehicle); setCurrentStatus(vehicle.status); setIsStatusModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('update_status')}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* View Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('vehicle_details_title')}: {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            {t('vehicle_details_desc')} {selectedVehicle?.type}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex justify-between"><strong>{t('license_plate')}:</strong> <span>{selectedVehicle?.licensePlate}</span></div>
                        <div className="flex justify-between"><strong>{t('type')}:</strong> <span>{selectedVehicle?.type}</span></div>
                        <div className="flex justify-between"><strong>{t('fuel_type')}:</strong> <span>{selectedVehicle?.fuelType}</span></div>
                        <div className="flex justify-between"><strong>{t('capacity')}:</strong> <span>{selectedVehicle?.capacity} kg</span></div>
                        <div className="flex justify-between"><strong>{t('next_maintenance')}:</strong> <span>{selectedVehicle?.nextMaintenance}</span></div>
                        <div className="flex justify-between items-center"><strong>{t('status')}:</strong> <VehicleStatusBadge status={selectedVehicle?.status || 'available'} /></div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('update_status_title')}: {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            {t('update_status_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="status-select">{t('status')}</Label>
                        <Select value={currentStatus} onValueChange={(value) => setCurrentStatus(value as VehicleStatus)}>
                            <SelectTrigger id="status-select">
                                <SelectValue placeholder={t('select_status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">{t('available')}</SelectItem>
                                <SelectItem value="in-use">{t('in_use')}</SelectItem>
                                <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateStatus}>{t('save_changes')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
