
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import type { Client } from '@/lib/types';
import DashboardCards from "@/components/client/dashboard-cards";
import { useLanguage } from "@/context/language-context";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const clientFromDoc = (doc: DocumentData): Client => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        nextCollectionDate: data.nextCollectionDate?.toDate ? format(data.nextCollectionDate.toDate(), 'yyyy-MM-dd') : '',
        nextPaymentDueDate: data.nextPaymentDueDate?.toDate ? format(data.nextPaymentDueDate.toDate(), 'yyyy-MM-dd') : '',
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
        };

        const fetchClientData = async () => {
            setLoading(true);
            const q = query(collection(db, "clients"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                setClientData(clientFromDoc(doc));
            }
            setLoading(false);
        };

        fetchClientData();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!clientData) {
         return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t('hello')}!</h1>
                    <p className="text-muted-foreground mt-2">
                        It looks like your client account hasn't been fully set up by a service provider yet. 
                        Please contact your waste collection provider to link your account.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">{t('hello')}, {clientData.name}!</h1>
                <p className="text-muted-foreground">{t('client_dashboard_subtitle')}</p>
            </div>
            <DashboardCards client={clientData} />
        </div>
    );
}
