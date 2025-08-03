
"use client";

import { useState, useMemo } from 'react';
import type { Worker, Vehicle, TimesheetEntry } from '@/lib/types';
import { DUMMY_VEHICLES } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Calendar, Truck, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const WorkerStatusBadge = ({ status }: { status: 'working' | 'on-leave' }) => {
    return (
        <Badge variant={status === 'working' ? 'secondary' : 'outline'} className="capitalize">
            {status === 'working' ? <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> : <XCircle className="mr-1 h-3 w-3 text-red-500" />}
            {status.replace('-', ' ')}
        </Badge>
    );
};

export default function WorkforceList({ workers: initialWorkers }: { workers: Worker[] }) {
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [vehicles, setVehicles] = useState<Vehicle[]>(DUMMY_VEHICLES);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignedVehicleId, setAssignedVehicleId] = useState<string | null>(null);

    const handleAssignVehicle = () => {
        if (selectedWorker) {
            setWorkers(workers.map(w => w.id === selectedWorker.id ? { ...w, assignedVehicleId } : w));
            setIsAssignModalOpen(false);
        }
    };

    const totalHours = useMemo(() => {
        if (!selectedWorker || !selectedWorker.timesheet) return 0;
        return selectedWorker.timesheet.reduce((acc, entry) => acc + entry.totalHours, 0);
    }, [selectedWorker]);
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map(worker => (
                    <Card key={worker.id} className="flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16" data-ai-hint="person">
                                        <AvatarImage src={worker.imageUrl} alt={worker.name} />
                                        <AvatarFallback>
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>{worker.name}</CardTitle>
                                        <CardDescription>{worker.role}</CardDescription>
                                    </div>
                                </div>
                                 <WorkerStatusBadge status={worker.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Employment</span>
                                <span className="font-medium capitalize">{worker.employmentType}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Wage</span>
                                <span className="font-medium">{worker.wage.toFixed(2)} MT / hour</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Last Check-in</span>
                                <span className="font-medium">{worker.lastCheckIn ?? 'N/A'}</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Truck className="w-4 h-4" /> Assigned Vehicle</span>
                                <span className="font-medium">{worker.assignedVehicleId ?? 'N/A'}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedWorker(worker); setIsTimesheetModalOpen(true); }}>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Timesheet
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedWorker(worker); setAssignedVehicleId(worker.assignedVehicleId); setIsAssignModalOpen(true);}}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Assign Task
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Timesheet Modal */}
            <Dialog open={isTimesheetModalOpen} onOpenChange={setIsTimesheetModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Timesheet for {selectedWorker?.name}</DialogTitle>
                        <DialogDescription>
                            Recent check-in and check-out times for the current month.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead className="text-right">Total Hours</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedWorker?.timesheet?.map((entry) => (
                                    <TableRow key={entry.date}>
                                        <TableCell>{entry.date}</TableCell>
                                        <TableCell>{entry.checkIn}</TableCell>
                                        <TableCell>{entry.checkOut}</TableCell>
                                        <TableCell className="text-right">{entry.totalHours.toFixed(1)}</TableCell>
                                    </TableRow>
                                ))}
                                {!selectedWorker?.timesheet?.length && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">No timesheet entries found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <DialogFooter className="sm:justify-between">
                        <div className="font-bold">Total Monthly Hours: {totalHours.toFixed(1)}</div>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Task Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Task to {selectedWorker?.name}</DialogTitle>
                        <DialogDescription>
                            Assign a vehicle for the current shift.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="vehicle-select">Assign Vehicle</Label>
                        <Select value={assignedVehicleId || ''} onValueChange={(value) => setAssignedVehicleId(value)}>
                            <SelectTrigger id="vehicle-select">
                                <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {vehicles.filter(v => v.status === 'available' || v.id === selectedWorker?.assignedVehicleId).map(vehicle => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate} ({vehicle.type})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAssignVehicle}>Save Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

