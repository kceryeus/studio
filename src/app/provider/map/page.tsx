
"use client";
import CollectionMap from "@/components/provider/collection-map";
import RouteManager from "@/components/provider/route-manager";
import { DUMMY_ROUTES, DUMMY_CLIENTS } from "@/lib/data";
import { useState, useEffect } from "react";
import type { Route, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function ProviderMapPage() {
  const { t } = useLanguage();
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
          alert(t('alert_location_error'));
        }
      );
    } else {
      alert(t('alert_geolocation_not_supported'));
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
                <h2 className="text-2xl font-bold">{t('map_title')}</h2>
                <p className="text-muted-foreground">{t('map_subtitle')}</p>
            </div>
            <Button variant="outline" onClick={handleLocateUser}>
                <LocateFixed className="mr-2 h-4 w-4" />
                {t('my_location')}
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
