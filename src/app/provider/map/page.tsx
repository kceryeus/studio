
"use client";
import * as React from 'react';
import CollectionMap from "@/components/provider/collection-map";
import { DUMMY_CLIENTS, DUMMY_ROUTES } from "@/lib/data";
import { useLanguage } from "@/context/language-context";
import type { Client, Route } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { List, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProviderMapPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [routes, setRoutes] = React.useState<Route[]>(DUMMY_ROUTES);
  const [selectedRoute, setSelectedRoute] = React.useState<Route | null>(null);
  const [newRouteData, setNewRouteData] = React.useState<{waypoints: any[], geometry: any} | null>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [newRouteName, setNewRouteName] = React.useState('');
  
  const allVisibleClients = DUMMY_CLIENTS.filter(c => c.sharesLocation);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };
  
  const handleClearSelection = () => {
    setSelectedRoute(null);
  };
  
  const handleRouteChanged = (e: any) => {
    // This event is fired by the directions plugin
    if (e.waypoints && e.route) {
        const waypoints = e.waypoints.map((wp: any) => ({
            lat: wp.lat,
            lng: wp.lng,
        }));
        const geometry = e.route[0]?.geometry;
        setNewRouteData({ waypoints, geometry });
    }
  };

  const handleSaveRoute = () => {
    if (!newRouteName) {
        toast({
            variant: 'destructive',
            title: 'Route Name Required',
            description: 'Please enter a name for the new route.',
        });
        return;
    }
    if (!newRouteData || !newRouteData.waypoints || !newRouteData.geometry) {
        toast({
            variant: 'destructive',
            title: 'Route Not Found',
            description: 'Please create a route on the map first.',
        });
        return;
    }

    const newRoute: Route = {
        id: `ROUTE${Date.now()}`,
        name: newRouteName,
        weekdays: [], // Default to no weekdays, can be edited later
        path: newRouteData.waypoints,
        geometry: newRouteData.geometry, // Save the detailed geometry
    };

    setRoutes(prev => [...prev, newRoute]);
    setSelectedRoute(newRoute);
    setIsSaveModalOpen(false);
    setNewRouteName('');
    toast({
        title: 'Route Saved',
        description: `Route "${newRouteName}" has been successfully created.`,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden">
        <div className="flex-shrink-0 mb-4">
            <h2 className="text-2xl font-bold">{t('map_title')}</h2>
            <p className="text-muted-foreground">{t('route_manager_subtitle')}</p>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden">
            <Card className="md:col-span-1 lg:col-span-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><List /> All Routes</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-2 overflow-y-auto">
                    {routes.map(route => (
                        <Button
                            key={route.id}
                            variant={selectedRoute?.id === route.id ? 'secondary' : 'ghost'}
                            onClick={() => handleRouteSelect(route)}
                            className="justify-start"
                        >
                            {route.name}
                        </Button>
                    ))}
                    {routes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No routes created yet.</p>
                    )}
                </CardContent>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PlusCircle /> Create Route</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Use the controls on the map to define a new route, then save it here.</p>
                    <Button onClick={() => setIsSaveModalOpen(true)} className="w-full" disabled={!newRouteData}>
                        <Save className="mr-2 h-4 w-4"/>
                        Save Current Route
                    </Button>
                     <Button onClick={handleClearSelection} className="w-full" variant="outline">
                        Clear Selection
                    </Button>
                </CardContent>
            </Card>

            <div className="md:col-span-2 lg:col-span-3 flex-grow relative h-full w-full">
                <CollectionMap
                    clients={allVisibleClients}
                    route={selectedRoute}
                    onRouteChanged={handleRouteChanged}
                />
            </div>
        </div>

        <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save New Route</DialogTitle>
                    <DialogDescription>
                        Give your new route a name. You can assign collection days later.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="route-name">Route Name</Label>
                    <Input
                        id="route-name"
                        value={newRouteName}
                        onChange={(e) => setNewRouteName(e.target.value)}
                        placeholder="e.g., Bairro Central A"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveRoute}>Save Route</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
