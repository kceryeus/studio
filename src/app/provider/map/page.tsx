
"use client";
import React, { useEffect, useState } from 'react';
import CollectionMap from "@/components/provider/collection-map";
import { useLanguage } from "@/context/language-context";
import type { Client } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function ProviderMapPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const q = query(collection(db, "clients"), where("providerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const clientsData: Client[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.sharesLocation) {
                 clientsData.push({ id: doc.id, ...data } as Client);
            }
        });
        setClients(clientsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching clients for map: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden">
        <div className="flex-shrink-0 mb-4">
            <h2 className="text-2xl font-bold">{t('map_title')}</h2>
            <p className="text-muted-foreground">{t('map_subtitle')}</p>
        </div>
        <div className="flex-grow relative h-full w-full">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <CollectionMap clients={clients} />
            )}
        </div>
    </div>
  );
}
