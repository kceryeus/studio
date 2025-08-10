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
    return {
        id: doc.id,
        ...data,
        nextCollectionDate: data.nextCollectionDate?.toDate ? format(data.nextCollectionDate.toDate(), 'yyyy-MM-dd') : (data.nextCollectionDate || 'N/A'),
        nextPaymentDueDate: data.nextPaymentDueDate?.toDate ? format(data.nextPaymentDueDate.toDate(), 'yyyy-MM-dd') : (data.nextPaymentDueDate || 'N/A'),
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

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, [user]);

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // If client data exists...
    if (clientData) {
        // ... but they don't have a provider yet, show onboarding.
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
                            {/* This link is a placeholder for where the provider marketplace would be */}
                            <Link href="/provider/map">{t('go_to_provider_dashboard')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            )
        }
        
        // ... and they have a provider, show the full dashboard.
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

    // Fallback for any other state (e.g., error fetching data, no client doc found for a logged-in user)
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not load your dashboard. Please try again later or contact support if the problem persists.</CardDescription>
            </CardHeader>
        </Card>
    );
}
