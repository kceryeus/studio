

"use client";

import { useState } from 'react';
import type { Vehicle, VehicleStatus, Worker } from '@/lib/types';
import { DUMMY_WORKERS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Fuel, Wrench, Calendar, Dot, Info, Edit, User, Gauge, Droplets, Hammer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
        <Badge variant="secondary" className="flex items-center gap-2 border-transparent">
            <Dot className={`w-4 h-4 -ml-1 ${color}`} />
            {text}
        </Badge>
    );
};


export default function FleetList({ vehicles: initialVehicles }: { vehicles: Vehicle[] }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<VehicleStatus>('available');

    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [vitalsData, setVitalsData] = useState({
        odometer: '',
        fuelLiters: '',
        fuelCost: '',
        maintenanceDesc: '',
        maintenanceCost: ''
    });

    const { toast } = useToast();
    const { t } = useLanguage();

    const getDriverName = (driverId: string | null) => {
        if (!driverId) return 'N/A';
        return DUMMY_WORKERS.find(w => w.id === driverId)?.name || 'Unknown';
    };

    const handleUpdateStatus = () => {
        if (selectedVehicle) {
            setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: currentStatus } : v));
            setIsStatusModalOpen(false);
            toast({ title: "Status Updated", description: `Vehicle ${selectedVehicle.licensePlate} status set to ${currentStatus}.` });
        }
    };

    const handleUpdateVitals = () => {
        if (!selectedVehicle) return;

        const updatedVehicle = { ...selectedVehicle };
        if (vitalsData.odometer) {
            updatedVehicle.odometer = parseInt(vitalsData.odometer, 10);
        }
        // Here you would typically also update fuel and maintenance logs
        
        setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        
        toast({ title: "Vitals Updated", description: `Vitals for ${selectedVehicle.licensePlate} have been updated.` });
        setIsVitalsModalOpen(false);
        setVitalsData({ odometer: '', fuelLiters: '', fuelCost: '', maintenanceDesc: '', maintenanceCost: '' });
    };

    const openVitalsModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setVitalsData({
            odometer: vehicle.odometer.toString(),
            fuelLiters: '',
            fuelCost: '',
            maintenanceDesc: '',
            maintenanceCost: ''
        });
        setIsVitalsModalOpen(true);
    };
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <Card key={vehicle.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Truck className="w-6 h-6" />
                                        {vehicle.licensePlate}
                                    </CardTitle>
                                    <CardDescription>{vehicle.type}</CardDescription>
                                </div>
                                <VehicleStatusBadge status={vehicle.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm flex-grow">
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Gauge className="w-4 h-4" /> Odometer</span>
                                <span className="font-medium">{vehicle.odometer.toLocaleString('en-US')} km</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Last Driver</span>
                                <span className="font-medium">{getDriverName(vehicle.lastDriverId)}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Wrench className="w-4 h-4" /> Last Service</span>
                                <span className="font-medium">{vehicle.lastServiceDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Maintenance</span>
                                <span className="font-medium">{vehicle.nextMaintenance}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setCurrentStatus(vehicle.status); setIsStatusModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('update_status')}
                            </Button>
                            <Button size="sm" onClick={() => openVitalsModal(vehicle)}>
                                <Info className="mr-2 h-4 w-4" />
                                Update Vitals
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

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

            {/* Update Vitals Modal */}
            <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Update Vitals for {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            Log new odometer readings, fuel consumption, and maintenance records.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="odometer" className="flex items-center gap-2"><Gauge className="w-4 h-4" /> Current Odometer (km)</Label>
                            <Input id="odometer" type="number" value={vitalsData.odometer} onChange={e => setVitalsData({...vitalsData, odometer: e.target.value})} />
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Droplets className="w-5 h-5 text-primary" /> Log Fueling</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fuelLiters">Fuel Added (Liters)</Label>
                                    <Input id="fuelLiters" type="number" value={vitalsData.fuelLiters} onChange={e => setVitalsData({...vitalsData, fuelLiters: e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fuelCost">Total Cost (MT)</Label>
                                    <Input id="fuelCost" type="number" value={vitalsData.fuelCost} onChange={e => setVitalsData({...vitalsData, fuelCost: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                         <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Hammer className="w-5 h-5 text-primary" /> Log Maintenance</h4>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2 col-span-2">
                                    <Label htmlFor="maintenanceDesc">Description</Label>
                                    <Input id="maintenanceDesc" value={vitalsData.maintenanceDesc} onChange={e => setVitalsData({...vitalsData, maintenanceDesc: e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceCost">Total Cost (MT)</Label>
                                    <Input id="maintenanceCost" type="number" value={vitalsData.maintenanceCost} onChange={e => setVitalsData({...vitalsData, maintenanceCost: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateVitals}>Save Vitals</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
