
"use client";
import React, { useEffect, useState } from 'react';
import PaymentForm from "@/components/client/payment-form";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Client } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ClientPaymentPage() {
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
                setClientData({ id: doc.id, ...doc.data() } as Client);
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
                    <h1 className="text-3xl font-bold font-headline">{t('make_a_payment_title')}</h1>
                    <p className="text-muted-foreground mt-2">
                        Your account is not yet linked to a service. Please contact your provider.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold font-headline">{t('make_a_payment_title')}</h1>
                <p className="text-muted-foreground">{t('make_a_payment_subtitle')}</p>
            </div>
            <PaymentForm client={clientData} />
        </div>
    );
}
