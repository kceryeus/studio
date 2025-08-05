
"use client";

import { useState } from 'react';
import type { Assignment, Worker, Vehicle, AssignmentStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

const AssignmentStatusBadge = ({ status }: { status: AssignmentStatus }) => {
    const { t } = useLanguage();
    return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {status === 'active' ? <Zap className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
            {t(status)}
        </Badge>
    );
};

const initialNewAssignmentState = {
    workerId: '',
    vehicleId: '',
    taskDescription: '',
};

export default function ActiveAssignments({
    initialAssignments,
    workers,
    vehicles,
}: {
    initialAssignments: Assignment[];
    workers: Worker[];
    vehicles: Vehicle[];
}) {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState(initialNewAssignmentState);
    const { toast } = useToast();
    const { t } = useLanguage();

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
        if (!newAssignment.workerId || !newAssignment.vehicleId || !newAssignment.taskDescription) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all fields to create an assignment.',
            });
            return;
        }

        const assignmentToAdd: Assignment = {
            id: `ASG${Date.now()}`,
            date: new Date().toISOString(),
            status: 'active',
            ...newAssignment,
        };

        setAssignments(prev => [...prev, assignmentToAdd]);
        toast({
            title: 'Assignment Created',
            description: `Task assigned to ${getWorkerName(assignmentToAdd.workerId)}.`,
        });
        setIsCreateModalOpen(false);
        setNewAssignment(initialNewAssignmentState);
    };

    const activeAssignments = assignments.filter(a => a.status === 'active');
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{t('active_assignments_title')}</CardTitle>
                            <CardDescription>{t('active_assignments_subtitle')}</CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('worker')}</TableHead>
                                <TableHead>{t('vehicle')}</TableHead>
                                <TableHead>{t('task')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead className="text-right">{t('action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeAssignments.map(assignment => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">{getWorkerName(assignment.workerId)}</TableCell>
                                    <TableCell>{getVehiclePlate(assignment.vehicleId)}</TableCell>
                                    <TableCell>{assignment.taskDescription}</TableCell>
                                    <TableCell>
                                        <AssignmentStatusBadge status={assignment.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkAsComplete(assignment.id)}
                                            disabled={assignment.status === 'completed'}
                                        >
                                            {t('mark_as_complete')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeAssignments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        {t('no_active_assignments')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Assignment Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
                             <Label htmlFor="task-description">Task Description</Label>
                             <Textarea 
                                id="task-description"
                                value={newAssignment.taskDescription}
                                onChange={e => setNewAssignment({...newAssignment, taskDescription: e.target.value})}
                                placeholder="e.g., Collect garbage on Route A, assist with recycling pickup..."
                             />
                        </div>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleCreateAssignment}>Create Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
