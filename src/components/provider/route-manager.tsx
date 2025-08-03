
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
import { PlusCircle } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function RouteManager({ 
    routes, 
    selectedRoute,
    onSelectRoute,
    onCreateRoute
}: { 
    routes: Route[], 
    selectedRoute: Route | null,
    onSelectRoute: (route: Route | null) => void,
    onCreateRoute: (route: Route) => void
}) {
    const { t } = useLanguage();
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [newRouteName, setNewRouteName] = React.useState('');
    const [newRouteDays, setNewRouteDays] = React.useState<DayOfWeek[]>([]);

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
    
    const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>{t('route_manager_title')}</CardTitle>
                    <CardDescription>{t('route_manager_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 overflow-y-auto">
                    <Button className="w-full" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('create_new_route')}
                    </Button>
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
                                    <Button size="sm" variant="ghost" className="w-full justify-start" disabled>{t('edit_route')}</Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    {routes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">{t('no_routes_created')}</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('create_new_route')}</DialogTitle>
                        <DialogDescription>{t('create_route_desc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="routeName">{t('route_name')}</Label>
                            <Input 
                                id="routeName" 
                                value={newRouteName} 
                                onChange={(e) => setNewRouteName(e.target.value)}
                                placeholder={t('route_name_placeholder')}
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>{t('collection_days')}</Label>
                             <ToggleGroup 
                                type="multiple" 
                                variant="outline" 
                                className="flex-wrap justify-start"
                                value={newRouteDays}
                                onValueChange={(value: DayOfWeek[]) => setNewRouteDays(value)}
                             >
                                {weekdays.map(day => (
                                    <ToggleGroupItem key={day} value={day} aria-label={`Toggle ${day}`}>
                                        {t(day).substring(0,3)}
                                    </ToggleGroupItem>
                                ))}
                             </ToggleGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleCreateRoute} disabled={!newRouteName || newRouteDays.length === 0}>{t('create_route_button')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
