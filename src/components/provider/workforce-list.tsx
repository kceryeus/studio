"use client";

import type { Worker } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const WorkerStatusBadge = ({ status }: { status: 'working' | 'on-leave' }) => {
    return (
        <Badge variant={status === 'working' ? 'secondary' : 'outline'} className="capitalize">
            {status === 'working' ? <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> : <XCircle className="mr-1 h-3 w-3 text-red-500" />}
            {status.replace('-', ' ')}
        </Badge>
    );
};

export default function WorkforceList({ workers }: { workers: Worker[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map(worker => (
                <Card key={worker.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-6 h-6 text-primary" />
                                    {worker.name}
                                </CardTitle>
                                <CardDescription>{worker.role}</CardDescription>
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
                            <span className="font-medium">${worker.wage.toFixed(2)} / hour</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Last Check-in</span>
                            <span className="font-medium">{worker.lastCheckIn ?? 'N/A'}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled>View Timesheet</Button>
                        <Button size="sm" disabled>Assign Task</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
