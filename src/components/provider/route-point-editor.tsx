"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { 
  PlusCircle, 
  MapPin, 
  Users, 
  Edit, 
  Trash2,
  Link,
  Unlink
} from 'lucide-react';
import type { Route, RoutePoint, Client } from '@/lib/types';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RoutingService } from '@/lib/routing-service';

interface RoutePointEditorProps {
  route: Route;
  clients: Client[];
  onRouteUpdate: (updatedRoute: Route) => void;
  isEditing?: boolean;
}

export default function RoutePointEditor({ route, clients, onRouteUpdate, isEditing = false }: RoutePointEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isAddPointModalOpen, setIsAddPointModalOpen] = useState(false);
  const [isEditPointModalOpen, setIsEditPointModalOpen] = useState(false);
  const [isLinkClientModalOpen, setIsLinkClientModalOpen] = useState(false);
  
  const [newPoint, setNewPoint] = useState({
    type: 'unassociated' as 'client' | 'unassociated',
    coordinates: { lat: -25.965, lng: 32.583 },
    clientId: '',
    notes: ''
  });
  
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [clientsWithoutLocation, setClientsWithoutLocation] = useState<Client[]>([]);

  useEffect(() => {
    setClientsWithoutLocation(clients.filter(client => !client.coordinates));
  }, [clients]);

  const handleAddPoint = async () => {
    if (!newPoint.coordinates) return;

    console.log('Adding point:', newPoint);
    console.log('Current route:', route);
    console.log('Route ID:', route.id);

    const pointToAdd: RoutePoint = {
      id: `point_${Date.now()}`,
      type: newPoint.type,
      coordinates: newPoint.coordinates,
      clientId: newPoint.type === 'client' ? newPoint.clientId : null,
      order: route.points ? route.points.length : 0,
      notes: newPoint.notes || undefined,
    };

    console.log('Point to add:', pointToAdd);

    // Ensure points is always an array
    const currentPoints = Array.isArray(route.points) ? route.points : [];
    const updatedPoints = [...currentPoints, pointToAdd];
    
    // Calculate route using street-based routing
    let totalDistance = 0;
    let estimatedDuration = 0;
    let routingData = null;
    
    try {
      if (updatedPoints.length >= 2) {
        const coordinates = updatedPoints.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
        const routingResponse = await RoutingService.getRoute(coordinates);
        const metrics = RoutingService.calculateRouteMetrics(routingResponse);
        
        totalDistance = metrics.totalDistance;
        estimatedDuration = metrics.totalDuration;
        routingData = RoutingService.flattenRoutingData(routingResponse);
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

    console.log('Updated points:', updatedPoints);
    console.log('Calculated metrics:', { totalDistance, estimatedDuration });

    try {
      const routeRef = doc(db, "routes", route.id);
      
      // Prepare update data, ensuring no undefined values
      const updateData: any = {
        points: updatedPoints,
        updatedAt: serverTimestamp(),
      };
      
      // Only add these fields if they have valid values
      if (totalDistance > 0) {
        updateData.totalDistance = totalDistance;
      }
      if (estimatedDuration > 0) {
        updateData.estimatedDuration = estimatedDuration;
      }
      if (routingData) {
        updateData.routingData = routingData;
      }
      
      console.log('Update data:', updateData);
      
      await updateDoc(routeRef, updateData);
      
      // Update local state with the new data
      const updatedRoute = {
        ...route,
        points: updatedPoints,
        totalDistance: totalDistance || 0,
        estimatedDuration: estimatedDuration || 0,
        routingData,
      };
      
      onRouteUpdate(updatedRoute as Route);

      toast({
        title: "Point Added",
        description: "Route point has been successfully added.",
      });
      setIsAddPointModalOpen(false);
      setNewPoint({
        type: 'unassociated',
        coordinates: { lat: -25.965, lng: 32.583 },
        clientId: '',
        notes: ''
      });
    } catch (error) {
      console.error("Error adding point: ", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Point",
        description: "Could not save point data."
      });
    }
  };

  const handleUpdatePoint = async () => {
    if (!editingPoint) return;

    // Ensure points is always an array
    const currentPoints = Array.isArray(route.points) ? route.points : [];
    const updatedPoints = currentPoints.map(point => 
      point.id === editingPoint.id ? editingPoint : point
    );
    
    // Calculate route using street-based routing
    let totalDistance = 0;
    let estimatedDuration = 0;
    let routingData = null;
    
    try {
      if (updatedPoints.length >= 2) {
        const coordinates = updatedPoints.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
        const routingResponse = await RoutingService.getRoute(coordinates);
        const metrics = RoutingService.calculateRouteMetrics(routingResponse);
        
        totalDistance = metrics.totalDistance;
        estimatedDuration = metrics.totalDuration;
        routingData = RoutingService.flattenRoutingData(routingResponse);
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

    try {
      const routeRef = doc(db, "routes", route.id);
      
      // Prepare update data, ensuring no undefined values
      const updateData: any = {
        points: updatedPoints,
        updatedAt: serverTimestamp(),
      };
      
      // Only add these fields if they have valid values
      if (totalDistance > 0) {
        updateData.totalDistance = totalDistance;
      }
      if (estimatedDuration > 0) {
        updateData.estimatedDuration = estimatedDuration;
      }
      if (routingData) {
        updateData.routingData = routingData;
      }
      
      await updateDoc(routeRef, updateData);
      
      // Update local state with the new data
      const updatedRoute = {
        ...route,
        points: updatedPoints,
        totalDistance: totalDistance || 0,
        estimatedDuration: estimatedDuration || 0,
        routingData,
      };
      
      onRouteUpdate(updatedRoute as Route);

      toast({
        title: "Point Updated",
        description: "Route point has been successfully updated.",
      });
      setIsEditPointModalOpen(false);
      setEditingPoint(null);
    } catch (error) {
      console.error("Error updating point: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update point data."
      });
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!confirm("Are you sure you want to delete this route point?")) return;

    // Ensure points is always an array
    const currentPoints = Array.isArray(route.points) ? route.points : [];
    const updatedPoints = currentPoints.filter(point => point.id !== pointId);
    
    // Calculate route using street-based routing
    let totalDistance = 0;
    let estimatedDuration = 0;
    let routingData = null;
    
    try {
      if (updatedPoints.length >= 2) {
        const coordinates = updatedPoints.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
        const routingResponse = await RoutingService.getRoute(coordinates);
        const metrics = RoutingService.calculateRouteMetrics(routingResponse);
        
        totalDistance = metrics.totalDistance;
        estimatedDuration = metrics.totalDuration;
        routingData = RoutingService.flattenRoutingData(routingResponse);
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

    try {
      const routeRef = doc(db, "routes", route.id);
      
      // Prepare update data, ensuring no undefined values
      const updateData: any = {
        points: updatedPoints,
        updatedAt: serverTimestamp(),
      };
      
      // Only add these fields if they have valid values
      if (totalDistance > 0) {
        updateData.totalDistance = totalDistance;
      }
      if (estimatedDuration > 0) {
        updateData.estimatedDuration = estimatedDuration;
      }
      if (routingData) {
        updateData.routingData = routingData;
      }
      
      await updateDoc(routeRef, updateData);
      
      // Update local state with the new data
      const updatedRoute = {
        ...route,
        points: updatedPoints,
        totalDistance: totalDistance || 0,
        estimatedDuration: estimatedDuration || 0,
        routingData,
      };
      
      onRouteUpdate(updatedRoute as Route);

      toast({
        title: "Point Deleted",
        description: "Route point has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting point: ", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete point."
      });
    }
  };

  const handleLinkClient = async (pointId: string, clientId: string) => {
    // Ensure points is always an array
    const currentPoints = Array.isArray(route.points) ? route.points : [];
    const updatedPoints = currentPoints.map(point => 
      point.id === pointId 
        ? { ...point, type: 'client' as const, clientId }
        : point
    );

    try {
      const routeRef = doc(db, "routes", route.id);
      
      // Prepare update data, ensuring no undefined values
      const updateData: any = {
        points: updatedPoints,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(routeRef, updateData);
      
      // Update local state with the new data
      const updatedRoute = {
        ...route,
        points: updatedPoints,
      };
      
      onRouteUpdate(updatedRoute as Route);

      toast({
        title: "Client Linked",
        description: "Route point has been linked to client successfully.",
      });
      setIsLinkClientModalOpen(false);
      setSelectedPoint(null);
    } catch (error) {
      console.error("Error linking client: ", error);
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: "Could not link client to route point."
      });
    }
  };

  const getClientInfo = (clientId: string) => {
    return clients.find(client => client.id === clientId);
  };

  const resetNewPoint = () => {
    setNewPoint({
      type: 'unassociated',
      coordinates: { lat: -25.965, lng: 32.583 },
      clientId: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Route Points</h3>
          <p className="text-sm text-muted-foreground">
            Manage collection points and their sequence
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddPointModalOpen(true)}
            disabled={!isEditing}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Point
          </Button>
          {isEditing && (
            <Button 
              variant="outline"
              onClick={() => {
                console.log('Test button clicked');
                console.log('Current route state:', route);
                console.log('Route points:', route.points);
                toast({
                  title: "Debug Info",
                  description: `Route has ${route.points.length} points. Check console for details.`,
                });
              }}
            >
              Debug Route
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {route.points.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No Route Points</h4>
            <p className="text-muted-foreground mb-4">
              Start building your route by adding collection points
            </p>
            <Button 
              onClick={() => setIsAddPointModalOpen(true)}
              disabled={!isEditing}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Point
            </Button>
          </Card>
        ) : (
          route.points
            .sort((a, b) => a.order - b.order)
            .map((point, index) => {
              const client = point.clientId ? getClientInfo(point.clientId) : null;
              return (
                <Card key={point.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={point.type === 'client' ? 'default' : 'secondary'}>
                            {point.type === 'client' ? 'Client' : 'Unassociated'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                        {client ? (
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={client.collectionStatus === 'active' ? 'default' : 'destructive'}>
                                {client.collectionStatus}
                              </Badge>
                              <Badge variant={client.userId ? 'secondary' : 'outline'}>
                                {client.userId ? 'Synced' : 'Unlinked'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {point.notes && (
                              <p className="text-sm">{point.notes}</p>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => {
                                setSelectedPoint(point);
                                setIsLinkClientModalOpen(true);
                              }}
                              disabled={!isEditing}
                            >
                              <Link className="mr-2 h-3 w-3" />
                              Link to Client
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingPoint(point);
                          setIsEditPointModalOpen(true);
                        }}
                        disabled={!isEditing}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePoint(point.id)}
                        disabled={!isEditing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
        )}
      </div>

      {/* Add Point Modal */}
      <Dialog open={isAddPointModalOpen} onOpenChange={setIsAddPointModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Route Point</DialogTitle>
            <DialogDescription>
              Add a new point to the route. You can link it to a client or keep it unassociated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Point Type</Label>
                <Select 
                  value={newPoint.type} 
                  onValueChange={(value: 'client' | 'unassociated') => 
                    setNewPoint(prev => ({...prev, type: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassociated">Unassociated Point</SelectItem>
                    <SelectItem value="client">Client Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newPoint.type === 'client' && (
                <div className="space-y-2">
                  <Label>Select Client</Label>
                  <Select 
                    value={newPoint.clientId} 
                    onValueChange={(value) => 
                      setNewPoint(prev => ({...prev, clientId: value}))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsWithoutLocation.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Coordinates</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={newPoint.coordinates.lat}
                    onChange={(e) => setNewPoint(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={newPoint.coordinates.lng}
                    onChange={(e) => setNewPoint(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={newPoint.notes} 
                  onChange={(e) => setNewPoint(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Collection instructions or notes"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Location Preview</Label>
              <div className="h-64 w-full rounded-md overflow-hidden relative border bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Coordinates: {newPoint.coordinates.lat.toFixed(4)}, {newPoint.coordinates.lng.toFixed(4)}</p>
                  <p className="text-sm">Click on the map in the main view to set location</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNewPoint}>Reset</Button>
            <Button onClick={handleAddPoint} disabled={!newPoint.coordinates.lat || !newPoint.coordinates.lng}>
              Add Point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Point Modal */}
      <Dialog open={isEditPointModalOpen} onOpenChange={setIsEditPointModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Route Point</DialogTitle>
            <DialogDescription>
              Update the route point information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingPoint && (
              <>
                <div className="space-y-2">
                  <Label>Coordinates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={editingPoint.coordinates.lat}
                      onChange={(e) => setEditingPoint(prev => prev ? {
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                      } : null)}
                    />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={editingPoint.coordinates.lng}
                      onChange={(e) => setEditingPoint(prev => prev ? {
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                      } : null)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={editingPoint.notes || ''} 
                    onChange={(e) => setEditingPoint(prev => prev ? {
                      ...prev,
                      notes: e.target.value
                    } : null)}
                    placeholder="Collection instructions or notes"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPointModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePoint} disabled={!editingPoint}>
              Update Point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Client Modal */}
      <Dialog open={isLinkClientModalOpen} onOpenChange={setIsLinkClientModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Client</DialogTitle>
            <DialogDescription>
              Link this route point to an existing client without a location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Select 
                onValueChange={(value) => {
                  if (selectedPoint) {
                    handleLinkClient(selectedPoint.id, value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsWithoutLocation.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkClientModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
