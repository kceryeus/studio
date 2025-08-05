
"use client";
import CollectionMap from "@/components/provider/collection-map";
import RouteManager from "@/components/provider/route-manager";
import { DUMMY_ROUTES, DUMMY_CLIENTS } from "@/lib/data";
import { useState } from "react";
import type { Route, Client, DayOfWeek } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LocateFixed, Save, Ban, MousePointerClick, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function ProviderMapPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>(DUMMY_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // State for the new interactive route creation
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRoutePoints, setNewRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDays, setNewRouteDays] = useState<DayOfWeek[]>([]);
  const [isSaving, setIsSaving] = useState(false);


  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert(t('alert_location_error'));
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert(t('alert_geolocation_not_supported'));
    }
  };

  const handleUpdateRoute = (updatedRoute: Route) => {
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
    if (selectedRoute?.id === updatedRoute.id) {
        setSelectedRoute(updatedRoute);
    }
  }

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (isDrawing) {
      setNewRoutePoints(prev => [...prev, coords]);
    }
  };

  const handleMarkerClick = (index: number) => {
    if (isDrawing) {
      setNewRoutePoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStartDrawing = () => {
    setSelectedRoute(null);
    setIsDrawing(true);
    setNewRoutePoints([]);
  }

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setNewRoutePoints([]);
  }

  const handleSaveRoute = async () => {
    if (!newRouteName || newRouteDays.length === 0 || newRoutePoints.length < 2) return;
    
    setIsSaving(true);
    try {
        const response = await fetch('/api/directions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: newRoutePoints }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("API Error:", errorDetails);
            throw new Error('Failed to generate route from API.');
        }

        const { path } = await response.json();

        const newRoute: Route = {
            id: `ROUTE${Date.now()}`,
            name: newRouteName,
            weekdays: newRouteDays,
            path: path,
        };
        
        setRoutes(prev => [...prev, newRoute]);
        setSelectedRoute(newRoute);
        
        toast({
            title: "Route Created",
            description: `Successfully created route "${newRoute.name}".`,
        });

        // Reset states
        setIsDrawing(false);
        setNewRoutePoints([]);
        setIsSaveModalOpen(false);
        setNewRouteName('');
        setNewRouteDays([]);

    } catch (error) {
        console.error("Error creating route:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create the route. The points may be too far apart or unreachable.",
        });
    } finally {
        setIsSaving(false);
    }
  };


  const allVisibleClients = DUMMY_CLIENTS.filter(c => c.sharesLocation);

  const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-shrink-0 px-1">
          <div>
              <h2 className="text-2xl font-bold">{t('map_title')}</h2>
              <p className="text-muted-foreground">{t('map_subtitle')}</p>
          </div>
          <Button variant="outline" onClick={handleLocateUser}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {t('my_location')}
          </Button>
      </div>

       {isDrawing && (
        <Alert className="mb-4 bg-primary/10 border-primary/20 text-primary-foreground">
          <MousePointerClick className="h-5 w-5" />
          <AlertDescription className="text-primary font-medium">
            Drawing Mode: Click on the map to add points to your route. Click a point to remove it.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <div className="lg:col-span-2 h-full min-h-[400px] relative">
           <CollectionMap 
              clients={allVisibleClients}
              route={selectedRoute}
              userLocation={userLocation}
              isDrawing={isDrawing}
              newRoutePoints={newRoutePoints}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
            />
        </div>
        <div className="lg:col-span-1 h-full overflow-hidden">
           <RouteManager 
              routes={routes} 
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              onStartCreateRoute={handleStartDrawing}
              onUpdateRoute={handleUpdateRoute}
              isDrawing={isDrawing}
          />
        </div>
      </div>
      {isDrawing && (
          <div className="absolute bottom-10 right-10 z-10 flex gap-2">
            <Button variant="destructive" onClick={handleCancelDrawing}>
                <Ban className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={() => setIsSaveModalOpen(true)} disabled={newRoutePoints.length < 2}>
                <Save className="mr-2 h-4 w-4" /> Save Route
            </Button>
          </div>
        )}

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save New Route</DialogTitle>
                    <DialogDescription>Give your new route a name and set the collection days.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="routeName">Route Name</Label>
                        <Input 
                            id="routeName" 
                            value={newRouteName} 
                            onChange={(e) => setNewRouteName(e.target.value)}
                            placeholder={t('route_name_placeholder')}
                        />
                    </div>
                    <div className="space-y-2">
                         <Label>Collection Days</Label>
                         <ToggleGroup 
                            type="multiple" 
                            variant="outline" 
                            className="flex-wrap justify-start"
                            value={newRouteDays}
                            onValueChange={(value: DayOfWeek[]) => setNewRouteDays(value)}
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
                    <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveRoute} disabled={!newRouteName || newRouteDays.length === 0 || isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>
    </div>
  );
}
