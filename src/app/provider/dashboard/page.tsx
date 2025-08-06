
"use client";
import React, { useEffect, useState } from 'react';
import ClientList from '@/components/provider/client-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Truck, AlertCircle, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/lib/types';

export default function ProviderDashboardPage() {
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
            clientsData.push({ id: doc.id, ...doc.data() } as Client);
        });
        setClients(clientsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching clients for dashboard: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalClients = clients.length;
  const activeCollections = clients.filter(c => c.garbageStatus === 'out').length;
  const issues = clients.filter(c => c.paymentStatus === 'overdue' || c.collectionStatus === 'suspended').length;
  
  return (
    <div className="space-y-6">
      <Card className="bg-accent border-accent-foreground/20">
        <CardContent className="p-4 flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Info className="h-6 w-6 text-accent-foreground" />
                <p className="text-sm text-accent-foreground">
                    {t('trial_period_message')} 
                    <Link href="/provider/subscribe" className="underline font-semibold ml-1">{t('view_subscription_plans')}</Link>
                </p>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10" asChild>
                <Link href="https://paysuite.tech/checkout/c3fe5a91-78ea-4ddc-8d92-e9de67dcceb9" target="_blank">
                    {t('subscribe_now')}
                </Link>
            </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_clients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{totalClients}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_collections_today')}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{activeCollections}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('clients_with_issues')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-destructive">{issues}</div>}
          </CardContent>
        </Card>
      </div>
      <ClientList />
    </div>
  );
}
