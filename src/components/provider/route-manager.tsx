
"use client";

import * as React from 'react';
import type { Route, DayOfWeek } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Pencil } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { cn } from '@/lib/utils';

export default function RouteManager({ 
    routes, 
    selectedRoute,
    onSelectRoute,
    onStartCreateRoute,
    onUpdateRoute,
    isDrawing
}: { 
    routes: Route[], 
    selectedRoute: Route | null,
    onSelectRoute: (route: Route | null) => void,
    onStartCreateRoute: () => void,
    onUpdateRoute: (route: Route) => void,
    isDrawing: boolean
}) {
    const { t } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingRoute, setEditingRoute] = React.useState<Route | null>(null);

    
    const handleEditRoute = () => {
        if (editingRoute) {
            onUpdateRoute(editingRoute);
            setIsEditModalOpen(false);
            setEditingRoute(null);
        }
    }
    
    const openEditModal = (route: Route) => {
        setEditingRoute(JSON.parse(JSON.stringify(route)));
        setIsEditModalOpen(true);
    }

    const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const renderEditDialog = () => (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('edit_route')}</DialogTitle>
                    <DialogDescription>{t('edit_route_desc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="routeName">{t('route_name')}</Label>
                        <Input 
                            id="routeName" 
                            value={editingRoute?.name || ''} 
                            onChange={(e) => setEditingRoute(prev => prev ? {...prev, name: e.target.value} : null)}
                            placeholder={t('route_name_placeholder')}
                        />
                    </div>
                    <div className="space-y-2">
                         <Label>{t('collection_days')}</Label>
                         <ToggleGroup 
                            type="multiple" 
                            variant="outline" 
                            className="flex-wrap justify-start"
                            value={editingRoute?.weekdays || []}
                            onValueChange={(value: DayOfWeek[]) => setEditingRoute(prev => prev ? {...prev, weekdays: value} : null)}
                         >
                            {weekdays.map(day => (
                                <ToggleGroupItem key={day} value={day} aria-label={t(day, {lng: 'en'})}>
                                    {t(day as any).substring(0,3)}
                                </ToggleGroupItem>
                            ))}
                         </ToggleGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
                    <Button onClick={handleEditRoute} disabled={!editingRoute?.name || !editingRoute?.weekdays || editingRoute.weekdays.length === 0}>
                        {t('save_changes')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <Card className={cn("h-full flex flex-col transition-opacity", isDrawing && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle>{t('route_manager_title')}</CardTitle>
                    <CardDescription>{t('route_manager_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 overflow-hidden flex flex-col">
                    <Button className="w-full" variant="outline" onClick={onStartCreateRoute} disabled={isDrawing}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('create_new_route')}
                    </Button>
                    <ScrollArea className="flex-grow">
                        <Accordion type="single" collapsible value={selectedRoute?.id} onValueChange={(id) => onSelectRoute(routes.find(r => r.id === id) || null)}>
                            {routes.map(route => (
                                <AccordionItem value={route.id} key={route.id}>
                                    <AccordionTrigger>
                                        {route.name}
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                       <div className="flex flex-wrap gap-1">
                                         {route.weekdays.map(day => (
                                            <Badge key={day} variant="secondary">{t(day as any).substring(0,3)}</Badge>
                                         ))}
                                       </div>
                                        <Button size="sm" variant="ghost" className="w-full justify-start gap-2" onClick={() => openEditModal(route)}>
                                            <Pencil className="w-3 h-3"/> {t('edit_route')}
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        {routes.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('no_routes_created')}</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

             {renderEditDialog()}
        </>
    )
}
