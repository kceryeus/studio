
"use client";

import { useState } from 'react';
import type { Vehicle, VehicleStatus, FuelLogEntry, MaintenanceLogEntry, FuelType } from '@/lib/types';
import { DUMMY_WORKERS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Fuel, Wrench, Calendar, Dot, Info, Edit, User, Gauge, Droplets, Hammer, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

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
        <Badge variant="secondary" className="flex items-center gap-2 border-transparent">
            <Dot className={`w-4 h-4 -ml-1 ${color}`} />
            {text}
        </Badge>
    );
};

const initialVitalsState = {
    odometer: '',
    fuelLiters: '',
    fuelCost: '',
    fuelType: 'Diesel' as FuelType,
    maintenanceDesc: '',
    maintenanceCost: ''
};

export default function FleetList({ vehicles: initialVehicles }: { vehicles: Vehicle[] }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<VehicleStatus>('available');

    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [vitalsData, setVitalsData] = useState(initialVitalsState);

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

    const handleLogVitals = () => {
        if (!selectedVehicle) return;

        let updatedVehicle = { ...selectedVehicle };
        
        // Update odometer if provided
        if (vitalsData.odometer) {
            updatedVehicle.odometer = parseInt(vitalsData.odometer, 10);
        }

        // Add fuel log entry
        if (vitalsData.fuelLiters && vitalsData.fuelCost) {
            const newFuelEntry: FuelLogEntry = {
                id: `FUEL${Date.now()}`,
                date: new Date().toISOString(),
                liters: parseFloat(vitalsData.fuelLiters),
                cost: parseFloat(vitalsData.fuelCost),
                odometer: parseInt(vitalsData.odometer, 10),
                fuelType: vitalsData.fuelType
            };
            updatedVehicle.fuelLog = [...(updatedVehicle.fuelLog || []), newFuelEntry];
        }

        // Add maintenance log entry
        if (vitalsData.maintenanceDesc && vitalsData.maintenanceCost) {
            const newMaintenanceEntry: MaintenanceLogEntry = {
                id: `MAINT${Date.now()}`,
                date: new Date().toISOString(),
                description: vitalsData.maintenanceDesc,
                cost: parseFloat(vitalsData.maintenanceCost),
                odometer: parseInt(vitalsData.odometer, 10),
            };
             updatedVehicle.maintenanceLog = [...(updatedVehicle.maintenanceLog || []), newMaintenanceEntry];
             updatedVehicle.lastServiceDate = format(new Date(), 'yyyy-MM-dd');
        }
        
        setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        
        toast({ title: "Vitals Logged", description: `New entries for ${selectedVehicle.licensePlate} have been saved.` });
        setIsVitalsModalOpen(false);
        setVitalsData(initialVitalsState);
    };

    const openVitalsModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setVitalsData({
            ...initialVitalsState,
            odometer: vehicle.odometer.toString(),
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
                                <span className="font-medium">{format(new Date(vehicle.lastServiceDate), 'yyyy-MM-dd')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Maintenance</span>
                                <span className="font-medium">{format(new Date(vehicle.nextMaintenance), 'yyyy-MM-dd')}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                             <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setCurrentStatus(vehicle.status); setIsStatusModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('update_status')}
                            </Button>
                            <Button size="sm" onClick={() => openVitalsModal(vehicle)}>
                                <History className="mr-2 h-4 w-4" />
                                Vitals & History
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
                                <SelectItem value="in-use">{t('in-use')}</SelectItem>
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

             {/* Vitals & History Modal */}
            <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
                <DialogContent className="max-w-3xl flex flex-col h-[90vh] sm:h-auto">
                    <DialogHeader>
                        <DialogTitle>Vitals & History for {selectedVehicle?.licensePlate}</DialogTitle>
                        <DialogDescription>
                            Log new entries or review past fuel and maintenance records.
                        </DialogDescription>
                    </DialogHeader>
                     <Tabs defaultValue="log" className="flex flex-col flex-grow min-h-0">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="log">Log Entry</TabsTrigger>
                            <TabsTrigger value="fuel">Fuel History</TabsTrigger>
                            <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
                        </TabsList>
                        <div className="relative flex-grow mt-4 overflow-hidden">
                          <ScrollArea className="absolute inset-0 h-full w-full">
                            <div className="p-1">
                               <TabsContent value="log" className="mt-0 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="odometer" className="flex items-center gap-2"><Gauge className="w-4 h-4" /> Current Odometer (km)</Label>
                                        <Input id="odometer" type="number" value={vitalsData.odometer} onChange={e => setVitalsData({...vitalsData, odometer: e.target.value})} placeholder="e.g. 150234" />
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Droplets className="w-5 h-5 text-primary" /> Log Fueling</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fuelType">Fuel Type</Label>
                                                <Select value={vitalsData.fuelType} onValueChange={v => setVitalsData({...vitalsData, fuelType: v as FuelType})}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fuelLiters">Fuel Added (Liters)</Label>
                                                <Input id="fuelLiters" type="number" value={vitalsData.fuelLiters} onChange={e => setVitalsData({...vitalsData, fuelLiters: e.target.value})} placeholder="e.g. 50"/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fuelCost">Total Cost (MT)</Label>
                                                <Input id="fuelCost" type="number" value={vitalsData.fuelCost} onChange={e => setVitalsData({...vitalsData, fuelCost: e.target.value})} placeholder="e.g. 4500"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Hammer className="w-5 h-5 text-primary" /> Log Maintenance</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="maintenanceDesc">Description</Label>
                                                <Input id="maintenanceDesc" value={vitalsData.maintenanceDesc} onChange={e => setVitalsData({...vitalsData, maintenanceDesc: e.target.value})} placeholder="e.g. Oil change"/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenanceCost">Total Cost (MT)</Label>
                                                <Input id="maintenanceCost" type="number" value={vitalsData.maintenanceCost} onChange={e => setVitalsData({...vitalsData, maintenanceCost: e.target.value})} placeholder="e.g. 2500"/>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="fuel" className="mt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Liters</TableHead><TableHead className="text-right">Cost</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedVehicle?.fuelLog?.slice().reverse().map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{format(new Date(log.date), 'dd MMM, yyyy')}</TableCell>
                                                    <TableCell>{log.fuelType}</TableCell>
                                                    <TableCell>{log.liters.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">{log.cost.toFixed(2)} MT</TableCell>
                                                </TableRow>
                                            ))}
                                            {(!selectedVehicle?.fuelLog || selectedVehicle.fuelLog.length === 0) && (
                                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No fuel history</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                                <TabsContent value="maintenance" className="mt-0">
                                <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Cost</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedVehicle?.maintenanceLog?.slice().reverse().map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{format(new Date(log.date), 'dd MMM, yyyy')}</TableCell>
                                                    <TableCell>{log.description}</TableCell>
                                                    <TableCell className="text-right">{log.cost.toFixed(2)} MT</TableCell>
                                                </TableRow>
                                            ))}
                                            {(!selectedVehicle?.maintenanceLog || selectedVehicle.maintenanceLog.length === 0) && (
                                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No maintenance history</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            </div>
                           </ScrollArea>
                        </div>
                    </Tabs>
                    <DialogFooter className="flex-shrink-0 pt-4">
                        <Button variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleLogVitals}>Save Log Entry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
