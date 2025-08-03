
"use client";
import CollectionMap from "@/components/provider/collection-map";
import RouteManager from "@/components/provider/route-manager";
import { DUMMY_ROUTES, DUMMY_CLIENTS } from "@/lib/data";
import { useState } from "react";
import type { Route, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";

export default function ProviderMapPage() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(DUMMY_ROUTES[0]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Could not get your location. Please ensure you have enabled location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const clientsOnRoute = selectedRoute
    ? DUMMY_CLIENTS.filter(c => c.routeId === selectedRoute.id && c.sharesLocation)
    : [];

  const allVisibleClients = DUMMY_CLIENTS.filter(c => c.sharesLocation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-2xl font-bold">Interactive Collection Map</h2>
                <p className="text-muted-foreground">Visualize client locations and routes.</p>
            </div>
            <Button variant="outline" onClick={handleLocateUser}>
                <LocateFixed className="mr-2 h-4 w-4" />
                My Location
            </Button>
        </div>
        <CollectionMap 
            clients={allVisibleClients}
            routeClients={clientsOnRoute}
            userLocation={userLocation}
        />
      </div>
      <div className="lg:col-span-1">
         <RouteManager 
            routes={DUMMY_ROUTES} 
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
        />
      </div>
    </div>
  );
}
