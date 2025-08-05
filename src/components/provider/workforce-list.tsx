
"use client";

import { useState, useMemo } from 'react';
import type { Worker, Vehicle, TimesheetEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Calendar, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/language-context';

const WorkerStatusBadge = ({ status }: { status: 'working' | 'on-leave' }) => {
    const { t } = useLanguage();
    return (
        <Badge variant={status === 'working' ? 'secondary' : 'outline'} className="capitalize">
            {status === 'working' ? <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> : <XCircle className="mr-1 h-3 w-3 text-red-500" />}
            {t(status).replace('-', ' ')}
        </Badge>
    );
};

export default function WorkforceList({ workers: initialWorkers }: { workers: Worker[] }) {
    const [workers] = useState<Worker[]>(initialWorkers);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
    const { t } = useLanguage();

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
                                <span className="font-medium capitalize">{t(worker.employmentType)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> {t('wage')}</span>
                                <span className="font-medium">{worker.wage.toFixed(2)} MT / {t('hour')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> {t('last_check_in')}</span>
                                <span className="font-medium">{worker.lastCheckIn ?? 'N/A'}</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Truck className="w-4 h-4" /> {t('assigned_vehicle')}</span>
                                <span className="font-medium">{worker.assignedVehicleId ?? 'N/A'}</span>
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
