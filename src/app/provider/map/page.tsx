"use client";
import React, { useEffect, useState } from 'react';
import CollectionMap from "@/components/provider/collection-map";
import RoutesManager from "@/components/provider/routes-manager";
import { useLanguage } from "@/context/language-context";
import type { Client, Route } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, PlusCircle, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRouteColor } from '@/lib/utils';

export default function ProviderMapPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoutesManager, setShowRoutesManager] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  // Fetch clients for this provider
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "clients"), where("providerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData: Client[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.sharesLocation) {
          clientsData.push({ id: docSnap.id, ...data } as Client);
        }
      });
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching clients: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch routes for this provider
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "routes"), where("providerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData: Route[] = [];
      querySnapshot.forEach((docSnap) => {
        routesData.push({ id: docSnap.id, ...docSnap.data() } as Route);
      });
      setRoutes(routesData);
    }, (error) => {
      console.error("Error fetching routes: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Create a new route with proper structure
  async function createRoute(name: string) {
    if (!user || !name.trim()) {
      return;
    }
    
    try {
      const routeData = {
        name: name.trim(),
        color: generateRouteColor(),
        weekdays: ['Monday'], // Default to Monday
        collectionTimes: [],
        points: [], // Ensure points is always an empty array
        totalDistance: 0, // Ensure these fields have default values
        estimatedDuration: 0,
        isActive: true,
        providerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "routes"), routeData);
      setCurrentRouteId(docRef.id);
      // Keep isCreatingRoute true so user can add points
      setNewRouteName('');
    } catch (error) {
      console.error("Error creating route: ", error);
    }
  }

  // Add route point at map coordinates
  const handleAddRoutePoint = async (coordinates: { lat: number; lng: number }, routeId?: string) => {
    if (!user) {
      return;
    }

    // Use provided routeId, or fall back to currentRouteId for legacy behavior
    const targetRouteId = routeId || currentRouteId;
    if (!targetRouteId) {
      console.error('No target route ID provided for adding point');
      return;
    }

    try {
      const targetRoute = routes.find(r => r.id === targetRouteId);
      if (!targetRoute) {
        console.error('Target route not found:', targetRouteId);
        return;
      }

      const newPoint = {
        id: `point_${Date.now()}`,
        type: 'unassociated' as const,
        coordinates,
        order: Array.isArray(targetRoute.points) ? targetRoute.points.length : 0,
        notes: 'Added from map'
      };

      // Ensure points is always an array
      const currentPoints = Array.isArray(targetRoute.points) ? targetRoute.points : [];
      const updatedPoints = [...currentPoints, newPoint];
      
      // Calculate route using street-based routing
      let totalDistance = 0;
      let estimatedDuration = 0;
      let routingData = null;
      
      try {
        if (updatedPoints.length >= 2) {
          const routeCoordinates = updatedPoints.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
          const { RoutingService } = await import('@/lib/routing-service');
          const routingResponse = await RoutingService.getRoute(routeCoordinates);
          const metrics = RoutingService.calculateRouteMetrics(routingResponse);
          
          totalDistance = metrics.totalDistance;
          estimatedDuration = metrics.totalDuration;
          routingData = RoutingService.flattenRoutingData(routingResponse);
          
          console.log('Generated routing data:', {
            totalDistance,
            estimatedDuration,
            routingData: routingData ? {
              segmentCount: routingData.segmentCoordinates.length,
              totalDistance: routingData.totalDistance,
              totalDuration: routingData.totalDuration
            } : null
          });
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        // Fallback to straight-line calculation
        totalDistance = updatedPoints.reduce((total, point, index) => {
          if (index === 0) return 0;
          const prevPoint = updatedPoints[index - 1];
          const dx = point.coordinates.lng - prevPoint.coordinates.lng;
          const dy = point.coordinates.lat - prevPoint.coordinates.lat;
          return total + Math.sqrt(dx * dx + dy * dy) * 111000; // Rough conversion to meters
        }, 0);
        estimatedDuration = totalDistance / 13.89; // Assume 50 km/h average speed
      }
      
      const routeRef = doc(db, "routes", targetRouteId);
      
      // Clean data to ensure no undefined values
      const cleanUpdateData: any = {
        points: updatedPoints,
        updatedAt: serverTimestamp()
      };
      
      // Only add fields that have valid values
      if (typeof totalDistance === 'number' && totalDistance > 0) {
        cleanUpdateData.totalDistance = totalDistance;
      }
      if (typeof estimatedDuration === 'number' && estimatedDuration > 0) {
        cleanUpdateData.estimatedDuration = estimatedDuration;
      }
      if (routingData && typeof routingData === 'object') {
        // Clean routing data to remove any undefined fields
        const cleanRoutingData: any = {};
        const routingDataObj = routingData as any;
        Object.keys(routingDataObj).forEach(key => {
          if (routingDataObj[key] !== undefined && routingDataObj[key] !== null) {
            cleanRoutingData[key] = routingDataObj[key];
          }
        });
        if (Object.keys(cleanRoutingData).length > 0) {
          cleanUpdateData.routingData = cleanRoutingData;
        }
      }
      
      console.log('Storing route update:', cleanUpdateData);
      
      await updateDoc(routeRef, cleanUpdateData);
      
      console.log('Route point added successfully with street routing');
    } catch (error) {
      console.error("Error adding route point: ", error);
    }
  };

  const finishRouteCreation = () => {
    setCurrentRouteId(null);
    setIsCreatingRoute(false);
    setNewRouteName('');
    // Don't reload - let the real-time updates handle it
  };

  // Update route point coordinates
  const handleUpdateRoutePoint = async (routeId: string, pointId: string, newCoordinates: { lat: number; lng: number }) => {
    if (!user) return;

    try {
      const route = routes.find(r => r.id === routeId);
      if (!route || !route.points) return;

      const updatedPoints = route.points.map(point => 
        point.id === pointId 
          ? { ...point, coordinates: newCoordinates }
          : point
      );

      await updateRouteWithNewPoints(routeId, updatedPoints);
      console.log(`Updated point ${pointId} in route ${routeId} to:`, newCoordinates);
    } catch (error) {
      console.error('Error updating route point:', error);
    }
  };

  // Delete route point
  const handleDeleteRoutePoint = async (routeId: string, pointId: string) => {
    if (!user) return;

    try {
      const route = routes.find(r => r.id === routeId);
      if (!route || !route.points) return;

      const updatedPoints = route.points
        .filter(point => point.id !== pointId)
        .map((point, index) => ({ ...point, order: index })); // Reorder points

      await updateRouteWithNewPoints(routeId, updatedPoints);
      console.log(`Deleted point ${pointId} from route ${routeId}`);
    } catch (error) {
      console.error('Error deleting route point:', error);
    }
  };

  // Helper function to update route with new points and recalculate routing
  const updateRouteWithNewPoints = async (routeId: string, updatedPoints: any[]) => {
    let totalDistance = 0;
    let estimatedDuration = 0;
    let routingData = null;
    
    try {
      if (updatedPoints.length >= 2) {
        const routeCoordinates = updatedPoints.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
        const { RoutingService } = await import('@/lib/routing-service');
        const routingResponse = await RoutingService.getRoute(routeCoordinates);
        const metrics = RoutingService.calculateRouteMetrics(routingResponse);
        
        totalDistance = metrics.totalDistance;
        estimatedDuration = metrics.totalDuration;
        routingData = RoutingService.flattenRoutingData(routingResponse);
      }
    } catch (error) {
      console.error('Error recalculating route:', error);
      // Fallback calculation
      totalDistance = updatedPoints.reduce((total, point, index) => {
        if (index === 0) return 0;
        const prevPoint = updatedPoints[index - 1];
        const dx = point.coordinates.lng - prevPoint.coordinates.lng;
        const dy = point.coordinates.lat - prevPoint.coordinates.lat;
        return total + Math.sqrt(dx * dx + dy * dy) * 111000;
      }, 0);
      estimatedDuration = totalDistance / 13.89;
    }
    
    const routeRef = doc(db, "routes", routeId);
    
    // Clean data to ensure no undefined values
    const cleanUpdateData: any = {
      points: updatedPoints,
      updatedAt: serverTimestamp()
    };
    
    // Only add fields that have valid values
    if (typeof totalDistance === 'number' && totalDistance > 0) {
      cleanUpdateData.totalDistance = totalDistance;
    }
    if (typeof estimatedDuration === 'number' && estimatedDuration > 0) {
      cleanUpdateData.estimatedDuration = estimatedDuration;
    }
    if (routingData && typeof routingData === 'object') {
      // Clean routing data to remove any undefined fields
      const cleanRoutingData: any = {};
      const routingDataObj = routingData as any;
      Object.keys(routingDataObj).forEach(key => {
        if (routingDataObj[key] !== undefined && routingDataObj[key] !== null) {
          cleanRoutingData[key] = routingDataObj[key];
        }
      });
      if (Object.keys(cleanRoutingData).length > 0) {
        cleanUpdateData.routingData = cleanRoutingData;
      }
    }
    
    console.log('Clean update data for Firebase:', cleanUpdateData);
    await updateDoc(routeRef, cleanUpdateData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden">
      <div className="flex-shrink-0 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('map_title')}</h2>
          <p className="text-muted-foreground">{t('map_subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowRoutesManager(!showRoutesManager)}
          >
            {showRoutesManager ? 'Hide Routes' : 'Show Routes Manager'}
          </Button>
          {!isCreatingRoute ? (
            <Button onClick={() => setIsCreatingRoute(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Route
            </Button>
          ) : (
            <div className="flex gap-2">
              {currentRouteId && (
                <Button variant="outline" onClick={finishRouteCreation}>
                  Finish Creating Route
                </Button>
              )}
              <Button variant="outline" onClick={finishRouteCreation}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Route Creation */}
      {isCreatingRoute && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Create New Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Route name (e.g., Morning Route 1)"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && createRoute(newRouteName)}
              />
              <Button 
                onClick={() => createRoute(newRouteName)}
                disabled={!newRouteName.trim()}
              >
                Create
              </Button>
              <Button 
                variant="outline" 
                onClick={finishRouteCreation}
              >
                Cancel
              </Button>
            </div>
            {currentRouteId && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Route created! Click on the map to add collection points.</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Click "Finish Creating Route" in the top bar when you're done adding points.
                </div>
                <div className="mt-2 text-xs text-green-700">
                  💡 Tip: You can now click on the map to add collection points. Click "Finish Creating Route" when done.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Routes Manager */}
      {showRoutesManager && (
        <div className="mb-4 max-h-80 overflow-y-auto border rounded-lg bg-gray-50">
          <div className="p-4">
            <RoutesManager clients={clients} />
          </div>
        </div>
      )}

      <div className="flex-grow relative h-full w-full min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Debug Info */}
            <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded border text-xs">
              <div>Clients: {clients.length}</div>
              <div>Routes: {routes.length}</div>
              <div>Clients with coords: {clients.filter(c => c.coordinates).length}</div>
              <div>Active Routes: {routes.filter(r => r.isActive).length}</div>
              {currentRouteId && (
                <div className="mt-1 pt-1 border-t border-gray-200">
                  <div className="text-green-600 font-medium">Creating Route</div>
                  <div className="text-xs text-gray-600">Click map to add points</div>
                </div>
              )}
            </div>
            
            {/* Routing Quality Indicator */}
            <div className="absolute top-20 left-4 z-10 bg-white p-2 rounded border text-xs">
              <div className="font-medium mb-1">Routing Quality:</div>
              {routes.filter(r => r.isActive && r.points && r.points.length >= 2).map(route => (
                <div key={route.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${route.routingData ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs">{route.name}</span>
                  <span className={`text-xs px-1 py-0.5 rounded ${route.routingData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {route.routingData ? 'Street' : 'Straight'}
                  </span>
                </div>
              ))}
            </div>
            
                         {/* Map Instructions - COMMENTED OUT FOR CLEANUP */}
             {/* <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded border text-sm max-w-xs">
               <div className="font-medium mb-2">Map Instructions:</div>
               <div className="space-y-1 text-xs">
                 {currentRouteId ? (
                   <>
                     <div className="text-green-600 font-medium">✓ Route Creation Mode</div>
                     <div>• Click on the map to add collection points</div>
                     <div>• Click "Finish Creating Route" button when done</div>
                     <div>• Use "Show Routes Manager" to edit later</div>
                   </>
                 ) : (
                   <>
                     <div>• Click "Create Route" to create a new route</div>
                     <div>• Click on the map to add route points</div>
                     <div>• Use "Show Routes Manager" to manage routes</div>
                     <div>• Routes with points will show lines on the map</div>
                   </>
                 )}
               </div>
             </div> */}
             
             {/* Route Editing Indicator - COMMENTED OUT FOR CLEANUP */}
             {/* {showRoutesManager && (
               <div className="absolute top-20 right-4 z-10 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm max-w-xs">
                 <div className="flex items-center gap-2 text-blue-800 mb-2">
                   <MapPin className="h-4 w-4" />
                   <span className="font-medium">Routes Manager Active</span>
                 </div>
                 <div className="text-xs text-blue-700 space-y-1">
                   <div>• Select a route and click "Edit Route"</div>
                   <div>• Use this map to add collection points</div>
                   <div>• Save changes in the Routes Manager</div>
                 </div>
               </div>
             )} */}
            
            <CollectionMap 
              clients={clients} 
              routes={routes} 
              onAddRoutePoint={handleAddRoutePoint}
              onUpdateRoutePoint={handleUpdateRoutePoint}
              onDeleteRoutePoint={handleDeleteRoutePoint}
            />
          </>
        )}
      </div>
    </div>
  );
}


