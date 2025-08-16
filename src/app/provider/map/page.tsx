"use client";
import React, { useEffect, useState } from 'react';
import CollectionMap from "@/components/provider/collection-map";
import { useLanguage } from "@/context/language-context";
import type { Client, Route } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ProviderMapPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Create a new route
  async function createRoute(name: string, collectionDate: Date, clientIds: string[]) {
    if (!user) return;
    await addDoc(collection(db, "routes"), {
      name,
      providerId: user.uid,
      collectionDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clients: clientIds
    });
  }

  // Update existing route
  async function updateRoute(routeId: string, updates: Partial<Route>) {
    await updateDoc(doc(db, "routes", routeId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden">
      <div className="flex-shrink-0 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('map_title')}</h2>
          <p className="text-muted-foreground">{t('map_subtitle')}</p>
        </div>
        <Button onClick={() => createRoute("New Route", new Date(), [])}>
          {t('create_route')}
        </Button>
      </div>

      <div className="flex-grow relative h-full w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <CollectionMap 
            clients={clients} 
            routes={routes} 
            onRouteUpdate={updateRoute}
          />
        )}
      </div>
    </div>
  );
}
