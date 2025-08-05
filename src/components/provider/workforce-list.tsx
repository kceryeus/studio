
"use client";

import { useState, useMemo } from 'react';
import type { Worker, Vehicle, TimesheetEntry, Assignment, AssignmentStatus, Route } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Calendar, Truck, PlusCircle, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

const WorkerStatusBadge = ({ status }: { status: 'working' | 'on-leave' }) => {
    const { t } = useLanguage();
    return (
        <Badge variant={status === 'working' ? 'secondary' : 'outline'} className="capitalize">
            {status === 'working' ? <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> : <XCircle className="mr-1 h-3 w-3 text-red-500" />}
            {t(status as any).replace('-', ' ')}
        </Badge>
    );
};

const AssignmentStatusBadge = ({ status }: { status: AssignmentStatus }) => {
    const { t } = useLanguage();
    return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {status === 'active' ? <Zap className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
            {t(status as any)}
        </Badge>
    );
};

const initialNewAssignmentState = {
    workerId: '',
    vehicleId: '',
    taskType: 'route' as 'route' | 'extraordinary',
    routeId: '',
    taskDescription: '',
};

export default function WorkforceList({ 
    initialWorkers,
    initialAssignments,
    vehicles,
    routes
}: { 
    initialWorkers: Worker[],
    initialAssignments: Assignment[],
    vehicles: Vehicle[],
    routes: Route[]
}) {
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
    const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState(initialNewAssignmentState);

    const { t } = useLanguage();
    const { toast } = useToast();

    const totalHours = useMemo(() => {
        if (!selectedWorker || !selectedWorker.timesheet) return 0;
        return selectedWorker.timesheet.reduce((acc, entry) => acc + entry.totalHours, 0);
    }, [selectedWorker]);

    const getWorkerName = (workerId: string) => workers.find(w => w.id === workerId)?.name || 'Unknown';
    const getVehiclePlate = (vehicleId: string) => vehicles.find(v => v.id === vehicleId)?.licensePlate || 'N/A';
    
    const handleMarkAsComplete = (assignmentId: string) => {
        setAssignments(prev =>
            prev.map(assignment =>
                assignment.id === assignmentId ? { ...assignment, status: 'completed' } : assignment
            )
        );
        toast({
            title: t('assignment_completed_title'),
            description: t('assignment_completed_desc'),
        });
    };

    const handleCreateAssignment = () => {
        const { workerId, vehicleId, taskType, routeId, taskDescription } = newAssignment;
        
        if (!workerId || !vehicleId) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a worker and a vehicle.'});
            return;
        }

        let finalTaskDescription = '';
        if (taskType === 'route') {
            if (!routeId) {
                toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a route.'});
                return;
            }
            finalTaskDescription = `Route: ${routes.find(r => r.id === routeId)?.name || 'Unknown Route'}`;
        } else {
            if (!taskDescription) {
                 toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a task description.'});
                return;
            }
            finalTaskDescription = `Extraordinary: ${taskDescription}`;
        }

        const assignmentToAdd: Assignment = {
            id: `ASG${Date.now()}`,
            date: new Date().toISOString(),
            status: 'active',
            workerId,
            vehicleId,
            taskDescription: finalTaskDescription,
        };

        setAssignments(prev => [assignmentToAdd, ...prev]);
        toast({
            title: 'Assignment Created',
            description: `Task assigned to ${getWorkerName(assignmentToAdd.workerId)}.`,
        });
        setIsCreateAssignmentModalOpen(false);
        setNewAssignment(initialNewAssignmentState);
    };

    const activeAssignments = assignments.filter(a => a.status === 'active');
    const completedAssignments = assignments.filter(a => a.status === 'completed');
    
    return (
        <>
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{t('workforce_management_title')}</CardTitle>
                            <CardDescription>{t('workforce_management_subtitle')}</CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateAssignmentModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="workers">
                        <TabsList>
                            <TabsTrigger value="workers">Workers ({workers.length})</TabsTrigger>
                            <TabsTrigger value="active_assignments">Active Assignments ({activeAssignments.length})</TabsTrigger>
                            <TabsTrigger value="completed_assignments">Completed Assignments ({completedAssignments.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="workers" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {workers.map(worker => (
                                    <Card key={worker.id} className="flex flex-col justify-between">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-16 h-16" data-ai-hint="person face">
                                                        <AvatarImage src={worker.imageUrl} alt={worker.name} />
                                                        <AvatarFallback>
                                                            {worker.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle>{worker.name}</CardTitle>
                                                        <CardDescription>{t(worker.role as any)}</CardDescription>
                                                    </div>
                                                </div>
                                                <WorkerStatusBadge status={worker.status} />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> {t('employment')}</span>
                                                <span className="font-medium capitalize">{t(worker.employmentType as any)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> {t('wage')}</span>
                                                <span className="font-medium">{worker.wage.toFixed(2)} MT / {t('hour')}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedWorker(worker); setIsTimesheetModalOpen(true); }}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {t('view_timesheet')}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="active_assignments" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('worker')}</TableHead>
                                        <TableHead>{t('vehicle')}</TableHead>
                                        <TableHead>{t('task')}</TableHead>
                                        <TableHead className="text-right">{t('action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeAssignments.map(assignment => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{getWorkerName(assignment.workerId)}</TableCell>
                                            <TableCell>{getVehiclePlate(assignment.vehicleId)}</TableCell>
                                            <TableCell>{assignment.taskDescription}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleMarkAsComplete(assignment.id)}
                                                >
                                                    {t('mark_as_complete')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {activeAssignments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                {t('no_active_assignments')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="completed_assignments" className="mt-4">
                              <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('worker')}</TableHead>
                                        <TableHead>{t('vehicle')}</TableHead>
                                        <TableHead>{t('task')}</TableHead>
                                        <TableHead>{t('status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedAssignments.map(assignment => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{getWorkerName(assignment.workerId)}</TableCell>
                                            <TableCell>{getVehiclePlate(assignment.vehicleId)}</TableCell>
                                            <TableCell>{assignment.taskDescription}</TableCell>
                                            <TableCell>
                                                <AssignmentStatusBadge status={assignment.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {completedAssignments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                No completed assignments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={isCreateAssignmentModalOpen} onOpenChange={setIsCreateAssignmentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>
                           Assign a task to an available worker and vehicle.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="worker-select">Worker</Label>
                            <Select value={newAssignment.workerId} onValueChange={(value) => setNewAssignment({...newAssignment, workerId: value})}>
                                <SelectTrigger id="worker-select">
                                    <SelectValue placeholder="Select a worker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.filter(w => w.status === 'working').map(worker => (
                                        <SelectItem key={worker.id} value={worker.id}>{worker.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="vehicle-select">Vehicle</Label>
                            <Select value={newAssignment.vehicleId} onValueChange={(value) => setNewAssignment({...newAssignment, vehicleId: value})}>
                                <SelectTrigger id="vehicle-select">
                                    <SelectValue placeholder="Select an available vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.filter(v => v.status === 'available').map(vehicle => (
                                        <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate} ({vehicle.type})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                             <Label>Task Type</Label>
                              <Select value={newAssignment.taskType} onValueChange={(value: 'route' | 'extraordinary') => setNewAssignment({...newAssignment, taskType: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="route">Predefined Route</SelectItem>
                                    <SelectItem value="extraordinary">Extraordinary Task</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newAssignment.taskType === 'route' ? (
                            <div className="space-y-2">
                                <Label htmlFor="route-select">Route</Label>
                                <Select value={newAssignment.routeId} onValueChange={(value) => setNewAssignment({...newAssignment, routeId: value})}>
                                    <SelectTrigger id="route-select">
                                        <SelectValue placeholder="Select a predefined route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routes.map(route => (
                                            <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="task-description">Task Description</Label>
                                <Textarea 
                                    id="task-description"
                                    value={newAssignment.taskDescription}
                                    onChange={e => setNewAssignment({...newAssignment, taskDescription: e.target.value})}
                                    placeholder="e.g., Collect special waste from Av. Marginal, 1234"
                                />
                            </div>
                        )}
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleCreateAssignment}>Create Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Timesheet Modal */}
            <Dialog open={isTimesheetModalOpen} onOpenChange={setIsTimesheetModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('timesheet_for')} {selectedWorker?.name}</DialogTitle>
                        <DialogDescription>
                            {t('timesheet_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('date')}</TableHead>
                                    <TableHead>{t('check_in')}</TableHead>
                                    <TableHead>{t('check_out')}</TableHead>
                                    <TableHead className="text-right">{t('total_hours')}</TableHead>
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
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">{t('no_timesheet_entries')}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <DialogFooter className="sm:justify-between">
                        <div className="font-bold">{t('total_monthly_hours')}: {totalHours.toFixed(1)}</div>
                        <DialogClose asChild>
                            <Button variant="outline">{t('close')}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
