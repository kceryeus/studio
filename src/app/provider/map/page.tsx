
"use client";
import CollectionMap from "@/components/provider/collection-map";
import RouteManager from "@/components/provider/route-manager";
import { DUMMY_ROUTES, DUMMY_CLIENTS } from "@/lib/data";
import { useState } from "react";
import type { Route, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function ProviderMapPage() {
  const { t } = useLanguage();
  const [routes, setRoutes] = useState<Route[]>(DUMMY_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert(t('alert_location_error'));
        }
      );
    } else {
      alert(t('alert_geolocation_not_supported'));
    }
  };

  const handleCreateRoute = (newRoute: Route) => {
    setRoutes(prev => [...prev, newRoute]);
  }

  const clientsOnRoute = selectedRoute
    ? DUMMY_CLIENTS.filter(c => c.routeId === selectedRoute.id && c.sharesLocation)
    : [];

  const allVisibleClients = DUMMY_CLIENTS.filter(c => c.sharesLocation);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div>
              <h2 className="text-2xl font-bold">{t('map_title')}</h2>
              <p className="text-muted-foreground">{t('map_subtitle')}</p>
          </div>
          <Button variant="outline" onClick={handleLocateUser}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {t('my_location')}
          </Button>
      </div>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <CollectionMap 
              clients={allVisibleClients}
              routeClients={clientsOnRoute}
              userLocation={userLocation}
          />
        </div>
        <div className="lg:col-span-1 h-full">
           <RouteManager 
              routes={routes} 
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              onCreateRoute={handleCreateRoute}
          />
        </div>
      </div>
    </div>
  );
}
