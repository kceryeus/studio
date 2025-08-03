
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

export default function RouteManager({ 
    routes, 
    selectedRoute,
    onSelectRoute,
    onCreateRoute,
    onUpdateRoute
}: { 
    routes: Route[], 
    selectedRoute: Route | null,
    onSelectRoute: (route: Route | null) => void,
    onCreateRoute: (route: Route) => void,
    onUpdateRoute: (route: Route) => void
}) {
    const { t } = useLanguage();
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const [newRouteName, setNewRouteName] = React.useState('');
    const [newRouteDays, setNewRouteDays] = React.useState<DayOfWeek[]>([]);
    
    const [editingRoute, setEditingRoute] = React.useState<Route | null>(null);

    const handleCreateRoute = () => {
        if (newRouteName && newRouteDays.length > 0) {
            const newRoute: Route = {
                id: `ROUTE${Date.now()}`,
                name: newRouteName,
                weekdays: newRouteDays
            };
            onCreateRoute(newRoute);
            setIsCreateModalOpen(false);
            setNewRouteName('');
            setNewRouteDays([]);
        }
    }
    
    const handleEditRoute = () => {
        if (editingRoute) {
            onUpdateRoute(editingRoute);
            setIsEditModalOpen(false);
            setEditingRoute(null);
        }
    }
    
    const openEditModal = (route: Route) => {
        setEditingRoute(route);
        setIsEditModalOpen(true);
    }

    const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const renderRouteDialog = (
        isEdit: boolean,
        isOpen: boolean,
        onOpenChange: (open: boolean) => void,
        routeData: Partial<Route> | null,
        onDataChange: (data: Partial<Route>) => void,
        onSubmit: () => void,
        onClose: () => void
    ) => (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('edit_route') : t('create_new_route')}</DialogTitle>
                    <DialogDescription>{isEdit ? t('edit_route_desc') : t('create_route_desc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="routeName">{t('route_name')}</Label>
                        <Input 
                            id="routeName" 
                            value={routeData?.name || ''} 
                            onChange={(e) => onDataChange({ ...routeData, name: e.target.value })}
                            placeholder={t('route_name_placeholder')}
                        />
                    </div>
                    <div className="space-y-2">
                         <Label>{t('collection_days')}</Label>
                         <ToggleGroup 
                            type="multiple" 
                            variant="outline" 
                            className="flex-wrap justify-start"
                            value={routeData?.weekdays || []}
                            onValueChange={(value: DayOfWeek[]) => onDataChange({ ...routeData, weekdays: value })}
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
                    <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={onSubmit} disabled={!routeData?.name || !routeData?.weekdays || routeData.weekdays.length === 0}>
                        {isEdit ? t('save_changes') : t('create_route_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>{t('route_manager_title')}</CardTitle>
                    <CardDescription>{t('route_manager_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 overflow-hidden flex flex-col">
                    <Button className="w-full" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
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

            {/* Create Modal */}
            {renderRouteDialog(
                false,
                isCreateModalOpen,
                setIsCreateModalOpen,
                { name: newRouteName, weekdays: newRouteDays },
                (data) => {
                    setNewRouteName(data.name || '');
                    setNewRouteDays(data.weekdays || []);
                },
                handleCreateRoute,
                () => {
                    setIsCreateModalOpen(false);
                    setNewRouteName('');
                    setNewRouteDays([]);
                }
            )}

             {/* Edit Modal */}
             {renderRouteDialog(
                true,
                isEditModalOpen,
                setIsEditModalOpen,
                editingRoute,
                (data) => setEditingRoute(prev => ({...prev!, ...data})),
                handleEditRoute,
                () => {
                    setIsEditModalOpen(false);
                    setEditingRoute(null);
                }
            )}
        </>
    )
}
