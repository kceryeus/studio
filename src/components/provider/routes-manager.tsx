"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { 
  PlusCircle, 
  MapPin, 
  Route as RouteIcon, 
  Trash2, 
  Edit, 
  Eye,
  Calendar,
  Palette,
  X,
  Save,
  CheckCircle
} from 'lucide-react';
import type { Route, RoutePoint, Client, DayOfWeek } from '@/lib/types';
import { 
  generateRouteColor, 
  formatDuration, 
  formatDistance
} from '@/lib/utils';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RoutePointEditor from './route-point-editor';
import CollectionMap from './collection-map';

const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface RoutesManagerProps {
  clients: Client[];
}

export default function RoutesManager({ clients }: RoutesManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  
  const [newRoute, setNewRoute] = useState({
    name: '',
    color: generateRouteColor(),
    weekdays: [] as DayOfWeek[],
    collectionTimes: []
  });

  // Normalize route data to ensure all required properties exist
  const normalizeRoute = (routeData: any): Route => {
    return {
      id: routeData.id || '',
      name: routeData.name || 'Unnamed Route',
      color: routeData.color || generateRouteColor(),
      weekdays: routeData.weekdays || ['Monday'],
      collectionTimes: routeData.collectionTimes || [],
      points: routeData.points || [],
      totalDistance: routeData.totalDistance || 0,
      estimatedDuration: routeData.estimatedDuration || 0,
      isActive: routeData.isActive !== undefined ? routeData.isActive : true,
      providerId: routeData.providerId || '',
      createdAt: routeData.createdAt || serverTimestamp(),
      updatedAt: routeData.updatedAt || serverTimestamp(),
    };
  };

  // Fetch routes from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "routes"), where("providerId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData: Route[] = [];
      querySnapshot.forEach((doc) => {
        const normalizedRoute = normalizeRoute({ id: doc.id, ...doc.data() });
        routesData.push(normalizedRoute);
      });
      setRoutes(routesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching routes: ", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleCreateRoute = async () => {
    if (!user || !newRoute.name || newRoute.weekdays.length === 0) {
      toast({ 
        variant: 'destructive', 
        title: 'Missing Information', 
        description: 'Route name and at least one weekday are required.' 
      });
      return;
    }

    const routeToAdd: Omit<Route, 'id'> = {
      ...newRoute,
      points: [], // Ensure points is always an empty array
      totalDistance: 0, // Ensure these fields have default values
      estimatedDuration: 0,
      isActive: true,
      providerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "routes"), routeToAdd);
      
      // Create the new route object with the generated ID
      const newRouteWithId = {
        ...routeToAdd,
        id: docRef.id
      } as Route;
      
      // Don't automatically select the new route - let user choose when to edit
      toast({
        title: "Route Created",
        description: `Route "${newRoute.name}" created successfully! Click the eye icon to view and edit it.`,
      });
      
      // Show a more detailed success message
      setTimeout(() => {
        toast({
          title: "Next Steps",
          description: "1. Click the eye icon on your new route to view it. 2. Click 'Edit Route' to add points. 3. Use the map to add collection points.",
        });
      }, 1000);
      setIsCreateRouteModalOpen(false);
      setNewRoute({
        name: '',
        color: generateRouteColor(),
        weekdays: [],
        collectionTimes: []
      });
    } catch (error) {
      console.error("Error creating route: ", error);
      toast({
        variant: "destructive",
        title: "Failed to Create Route",
        description: "Could not save route data. Please try again."
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      await deleteDoc(doc(db, "routes", routeId));
      toast({
        title: "Route Deleted",
        description: "Route has been successfully deleted.",
      });
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error("Error deleting route: ", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete route."
      });
    }
  };

  const handleRouteUpdate = (updatedRoute: Route) => {
    setRoutes(prev => prev.map(route => 
      route.id === updatedRoute.id ? updatedRoute : route
    ));
    if (selectedRoute?.id === updatedRoute.id) {
      setSelectedRoute(updatedRoute);
    }
  };

  const handleSaveRoute = async () => {
    if (!editingRoute) return;

    try {
      const routeRef = doc(db, "routes", editingRoute.id);
      await updateDoc(routeRef, {
        ...editingRoute,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setRoutes(prev => prev.map(route => 
        route.id === editingRoute.id ? editingRoute : route
      ));
      
      if (selectedRoute?.id === editingRoute.id) {
        setSelectedRoute(editingRoute);
      }
      
      setEditingRoute(null);
      toast({
        title: "Route Saved",
        description: "Route changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving route: ", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save route changes. Please try again."
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRoute(null);
  };

  const recalculateAllRoutes = async () => {
    if (!user) return;
    
    toast({
      title: "Recalculating Routes",
      description: "Updating all routes with street-based routing...",
    });

    try {
      const { RoutingService } = await import('@/lib/routing-service');
      
      for (const route of routes) {
        // Ensure points is always an array and has at least 2 points
        const currentPoints = Array.isArray(route.points) ? route.points : [];
        if (currentPoints.length >= 2) {
          try {
            const coordinates = currentPoints
              .sort((a, b) => a.order - b.order)
              .map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
            
            const routingResponse = await RoutingService.getRoute(coordinates);
            const metrics = RoutingService.calculateRouteMetrics(routingResponse);
            const routingData = RoutingService.flattenRoutingData(routingResponse);
            
            const routeRef = doc(db, "routes", route.id);
            await updateDoc(routeRef, {
              totalDistance: metrics.totalDistance,
              estimatedDuration: metrics.totalDuration,
              routingData,
              updatedAt: serverTimestamp()
            });
            
            console.log(`Route ${route.name} recalculated successfully`);
          } catch (error) {
            console.error(`Error recalculating route ${route.name}:`, error);
          }
        } else {
          console.log(`Route ${route.name} skipped - insufficient points (${currentPoints.length})`);
        }
      }
      
      toast({
        title: "Routes Updated",
        description: "All routes have been recalculated with street-based routing.",
      });
    } catch (error) {
      console.error("Error recalculating routes:", error);
      toast({
        variant: "destructive",
        title: "Recalculation Failed",
        description: "Some routes could not be recalculated. Check console for details."
      });
    }
  };

  const fixRouteStructures = async () => {
    if (!user) return;
    
    toast({
      title: "Fixing Route Structures",
      description: "Fixing routes with incorrect data structure...",
    });

    try {
      let fixedCount = 0;
      
      for (const route of routes) {
        let needsUpdate = false;
        const updateData: any = {};
        
        // Fix points field if it's not an array
        if (!Array.isArray(route.points)) {
          console.log(`Fixing points field for route ${route.name} - was:`, typeof route.points, route.points);
          updateData.points = [];
          needsUpdate = true;
        }
        
        // Fix other fields that might be undefined
        if (route.totalDistance === undefined) {
          updateData.totalDistance = 0;
          needsUpdate = true;
        }
        
        if (route.estimatedDuration === undefined) {
          updateData.estimatedDuration = 0;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const routeRef = doc(db, "routes", route.id);
          await updateDoc(routeRef, {
            ...updateData,
            updatedAt: serverTimestamp()
          });
          fixedCount++;
          console.log(`Route ${route.name} structure fixed`);
        }
      }
      
      if (fixedCount > 0) {
        toast({
          title: "Routes Fixed",
          description: `${fixedCount} routes have been fixed.`,
        });
      } else {
        toast({
          title: "No Fixes Needed",
          description: "All routes have the correct structure.",
        });
      }
    } catch (error) {
      console.error("Error fixing route structures:", error);
      toast({
        variant: "destructive",
        title: "Fix Failed",
        description: "Could not fix route structures. Check console for details."
      });
    }
  };

  const resetNewRoute = () => {
    setNewRoute({
      name: '',
      color: generateRouteColor(),
      weekdays: [],
      collectionTimes: []
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-full overflow-y-auto">
      {/* Routes Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RouteIcon className="h-5 w-5 text-primary" />
                Routes Management
              </CardTitle>
              <CardDescription className="text-sm">
                Create and manage collection routes for efficient waste collection planning.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                             {editingRoute && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                   <MapPin className="h-4 w-4" />
                   Editing: {editingRoute.name} - Use main map below to add points
                 </div>
               )}
              <Button onClick={() => setIsCreateRouteModalOpen(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Route
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={recalculateAllRoutes}
                disabled={routes.length === 0}
              >
                <RouteIcon className="mr-2 h-4 w-4" />
                Recalculate Routes
              </Button>
                             <Button 
                 variant="outline"
                 size="sm"
                 onClick={fixRouteStructures}
               >
                 Fix Routes
              </Button>
                             <Button 
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   setSelectedRoute(null);
                   setEditingRoute(null);
                   // Force a refresh to clear any cached state
                   window.location.reload();
                 }}
               >
                 Clear Selection
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {routes.map(route => (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: route.color || '#3B82F6' }}
                      />
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRoute(route.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{route.weekdays ? route.weekdays.join(', ') : 'No days set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{Array.isArray(route.points) ? route.points.length : 0} points</span>
                    {route.routingData && route.routingData.segmentCoordinates && route.routingData.segmentCoordinates.length > 0 ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        🛣️ Street
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                        📏 Straight
                      </Badge>
                    )}
                  </div>
                                     {route.totalDistance && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <RouteIcon className="h-4 w-4" />
                       <span>
                         {route.routingData ? '🛣️ ' : '📏 '}
                         {formatDistance(route.totalDistance)} • {formatDuration(route.estimatedDuration || 0)}
                       </span>
                     </div>
                   )}
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={route.isActive} 
                      onCheckedChange={async (checked) => {
                        try {
                          const routeRef = doc(db, "routes", route.id);
                          await updateDoc(routeRef, { 
                            isActive: checked, 
                            updatedAt: serverTimestamp() 
                          });
                        } catch (error) {
                          console.error("Error updating route status: ", error);
                        }
                      }}
                    />
                    <span className="text-sm">{route.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Details */}
      {selectedRoute && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedRoute.color || '#3B82F6' }}
                />
                <div>
                  <CardTitle className="text-lg">{selectedRoute.name}</CardTitle>
                  <CardDescription className="text-sm">
                    Manage route details, points, and collection schedule
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {editingRoute ? (
                  <>
                    <Button onClick={handleSaveRoute} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save Route
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditingRoute(selectedRoute)} size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Route
                  </Button>
                )}
                                 <Button 
                   variant="outline" 
                   onClick={async () => {
                      if (selectedRoute) {
                        // Ensure points is always an array and has at least 2 points
                        const currentPoints = Array.isArray(selectedRoute.points) ? selectedRoute.points : [];
                        if (currentPoints.length >= 2) {
                       try {
                         const { RoutingService } = await import('@/lib/routing-service');
                            const coordinates = currentPoints
                           .sort((a, b) => a.order - b.order)
                           .map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
                         
                         const routingResponse = await RoutingService.getRoute(coordinates);
                         const metrics = RoutingService.calculateRouteMetrics(routingResponse);

                         const routeRef = doc(db, "routes", selectedRoute.id);
                         await updateDoc(routeRef, {
                           totalDistance: metrics.totalDistance,
                           estimatedDuration: metrics.totalDuration,
                           routingData: RoutingService.flattenRoutingData(routingResponse),
                           updatedAt: serverTimestamp()
                         });
                         
                         toast({
                           title: "Route Recalculated",
                           description: "Route now follows actual streets for accurate metrics.",
                         });
                       } catch (error) {
                         console.error('Error recalculating route:', error);
                         toast({
                           variant: "destructive",
                           title: "Recalculation Failed",
                           description: "Could not recalculate route. Using fallback calculation."
                            });
                          }
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Insufficient Points",
                            description: "Route needs at least 2 points to calculate street routing."
                         });
                       }
                     }
                   }}
                   size="sm"
                    disabled={!selectedRoute || !Array.isArray(selectedRoute.points) || selectedRoute.points.length < 2}
                 >
                   <RouteIcon className="mr-2 h-4 w-4" />
                   Recalculate Route
                 </Button>
                 <Button variant="outline" onClick={() => setSelectedRoute(null)} size="sm">
                   <X className="mr-2 h-4 w-4" />
                   Close
                 </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="points" className="w-full">
                             <TabsList>
                 <TabsTrigger value="points">Route Points</TabsTrigger>
                 <TabsTrigger value="map">Map Info</TabsTrigger>
                 <TabsTrigger value="schedule">Schedule</TabsTrigger>
                 <TabsTrigger value="metrics">Metrics</TabsTrigger>
               </TabsList>
              
              <TabsContent value="points" className="space-y-4">
                <RoutePointEditor 
                  route={editingRoute || selectedRoute} 
                  clients={clients} 
                  onRouteUpdate={handleRouteUpdate}
                  isEditing={!!editingRoute}
                />
              </TabsContent>

                             <TabsContent value="map" className="space-y-4">
                 <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                   <div className="flex items-center gap-2 text-blue-800">
                     <MapPin className="h-4 w-4" />
                     <span className="font-medium">Map Instructions</span>
                   </div>
                   <div className="text-sm text-blue-600 mt-1">
                     {editingRoute 
                       ? "Use the main map below to add collection points. Points will be saved when you click 'Save Route'."
                       : "Click 'Edit Route' to enable adding points on the main map below."
                     }
                   </div>
                   {editingRoute && (
                     <div className="mt-2 text-xs text-blue-700">
                       💡 Tip: The main map below is now active for adding points to this route
                     </div>
                   )}
                 </div>
                 <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                   <div className="text-center text-gray-500">
                     <MapPin className="h-8 w-8 mx-auto mb-2" />
                     <p className="font-medium">Map View</p>
                     <p className="text-sm">Use the main map below to add and manage route points</p>
                   </div>
                 </div>
               </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Collection Days</h4>
                    <div className="space-y-2">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRoute.weekdays ? selectedRoute.weekdays.includes(day) : false}
                            onChange={(e) => {
                              // Handle day updates
                            }}
                          />
                          <span className="text-sm">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Collection Times</h4>
                    <div className="space-y-2">
                      {selectedRoute.collectionTimes && selectedRoute.collectionTimes.length > 0 ? (
                        selectedRoute.collectionTimes.map((time, index) => (
                          <div key={time.id} className="flex items-center gap-2">
                            <span className="text-sm">{time.time}</span>
                            <span className="text-sm text-muted-foreground">
                              ({formatDuration(time.estimatedDuration)})
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No collection times set</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

                             <TabsContent value="metrics" className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-3">
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">
                         {selectedRoute.totalDistance ? formatDistance(selectedRoute.totalDistance) : '0m'}
                       </div>
                       {selectedRoute.routingData && (
                         <div className="text-xs text-green-600 mt-1">
                           🛣️ Street-based routing
                         </div>
                       )}
                     </CardContent>
                   </Card>
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium">Estimated Duration</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">
                         {selectedRoute.estimatedDuration ? formatDuration(selectedRoute.estimatedDuration) : '0m'}
                       </div>
                       {selectedRoute.routingData && (
                         <div className="text-xs text-green-600 mt-1">
                           🚗 Real traffic estimates
                         </div>
                       )}
                     </CardContent>
                   </Card>
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium">Collection Points</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-2xl font-bold">{selectedRoute.points ? selectedRoute.points.length : 0}</div>
                     </CardContent>
                   </Card>
                 </div>
                 
                 {selectedRoute.routingData && (
                   <Card>
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium">Routing Details</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span>Routing Type:</span>
                           <span className="font-medium">Street-based (🛣️)</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Last Calculated:</span>
                           <span className="font-medium">
                             {selectedRoute.routingData.lastCalculated ? 
                               new Date(selectedRoute.routingData.lastCalculated.seconds * 1000).toLocaleDateString() : 
                               'Unknown'}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span>Route Segments:</span>
                           <span className="font-medium">{selectedRoute.routingData.segmentCoordinates?.length || 0}</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}
               </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create Route Modal */}
      <Dialog open={isCreateRouteModalOpen} onOpenChange={setIsCreateRouteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Route</DialogTitle>
            <DialogDescription>
              Set up a new collection route with basic information. After creation, click the eye icon to view and edit it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name *</Label>
              <Input 
                id="route-name" 
                value={newRoute.name} 
                onChange={e => setNewRoute(prev => ({...prev, name: e.target.value}))}
                placeholder="Morning Route 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-color">Route Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                  style={{ backgroundColor: newRoute.color }}
                  onClick={() => setNewRoute(prev => ({...prev, color: generateRouteColor()}))}
                />
                <Input 
                  id="route-color" 
                  value={newRoute.color} 
                  onChange={e => setNewRoute(prev => ({...prev, color: e.target.value}))}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Collection Days *</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRoute.weekdays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRoute(prev => ({
                            ...prev,
                            weekdays: [...prev.weekdays, day]
                          }));
                        } else {
                          setNewRoute(prev => ({
                            ...prev,
                            weekdays: prev.weekdays.filter(d => d !== day)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNewRoute}>Reset</Button>
            <Button onClick={handleCreateRoute} disabled={!newRoute.name || newRoute.weekdays.length === 0}>
              Create Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
