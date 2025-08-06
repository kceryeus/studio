
"use client";
import React, { useState, useEffect } from 'react';
import PaymentReports from "@/components/provider/payment-reports";
import { useLanguage } from "@/context/language-context";
import { DUMMY_TRANSACTIONS } from "@/lib/data";
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/lib/types';

export default function ProviderPaymentsPage() {
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
            console.error("Error fetching clients for payments page: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">{t('payments_reporting_title')}</h2>
                <p className="text-muted-foreground mb-4">{t('payments_reporting_subtitle')}</p>
            </div>
            <PaymentReports transactions={DUMMY_TRANSACTIONS} clients={clients} />
        </div>
    );
}
