
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import type { Client } from '@/lib/types';
import DashboardCards from "@/components/client/dashboard-cards";
import { useLanguage } from "@/context/language-context";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const clientFromDoc = (doc: DocumentData): Client => {
    const data = doc.data();
    // Safely format dates only if they exist
    const nextCollectionDate = data.nextCollectionDate?.toDate ? format(data.nextCollectionDate.toDate(), 'yyyy-MM-dd') : 'N/A';
    const nextPaymentDueDate = data.nextPaymentDueDate?.toDate ? format(data.nextPaymentDueDate.toDate(), 'yyyy-MM-dd') : 'N/A';
    
    return {
        id: doc.id,
        ...data,
        nextCollectionDate,
        nextPaymentDueDate,
        paymentHistory: data.paymentHistory?.map((p: any) => ({
            ...p,
            date: p.date?.toDate ? format(p.date.toDate(), 'yyyy-MM-dd') : p.date,
        })) || []
    } as Client;
};

export default function ClientDashboardPage() {
    const { t } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [clientData, setClientData] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "clients"), where("userId", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                setClientData(clientFromDoc(doc));
            } else {
                setClientData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching client data:", err);
            setClientData(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (clientData) {
        if (!clientData.providerId) {
            return (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Welcome to RECOLIXO!</CardTitle>
                        <CardDescription>You're all set up. The next step is to choose a service provider for your waste collection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Browse available providers in your area to find the best service for you.</p>
                        <Button asChild>
                            <Link href="/provider/map">{t('go_to_provider_dashboard')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            )
        }
        
        return (
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">
                        {t('hello')}
                        {user?.displayName && `, ${user.displayName}`}
                        !
                    </h1>
                    <p className="text-muted-foreground">{t('client_dashboard_subtitle')}</p>
                </div>
                <DashboardCards client={clientData} />
            </div>
        );
    }

    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not load your dashboard. Please try again later or contact support if the problem persists.</CardDescription>
            </CardHeader>
        </Card>
    );
}
