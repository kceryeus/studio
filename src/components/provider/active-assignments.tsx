
"use client";

import { useState } from 'react';
import type { Assignment, Worker, Vehicle, AssignmentStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

const AssignmentStatusBadge = ({ status }: { status: AssignmentStatus }) => {
    const { t } = useLanguage();
    return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {status === 'active' ? <Zap className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
            {t(status)}
        </Badge>
    );
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
    
    const activeAssignments = assignments.filter(a => a.status === 'active');
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('active_assignments_title')}</CardTitle>
                <CardDescription>{t('active_assignments_subtitle')}</CardDescription>
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
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    {t('no_active_assignments')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
