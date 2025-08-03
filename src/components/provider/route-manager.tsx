
"use client";

import type { Route } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function RouteManager({ 
    routes, 
    selectedRoute,
    onSelectRoute 
}: { 
    routes: Route[], 
    selectedRoute: Route | null,
    onSelectRoute: (route: Route | null) => void 
}) {
    const { t } = useLanguage();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('route_manager_title')}</CardTitle>
                <CardDescription>{t('route_manager_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full" variant="outline" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('create_new_route')}
                </Button>
                <Accordion type="single" collapsible defaultValue={selectedRoute?.id}>
                    {routes.map(route => (
                        <AccordionItem value={route.id} key={route.id}>
                            <AccordionTrigger onClick={() => onSelectRoute(route)}>
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
    )
}
