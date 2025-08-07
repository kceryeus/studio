
"use client";
import React, { useEffect, useState } from 'react';
import PaymentForm from "@/components/client/payment-form";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import type { Client } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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
                setClientData(clientFromDoc(doc));
            }
            setLoading(false);
        };

        fetchClientData();
    }, [user, authLoading]);

    if (loading || authLoading || !clientData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
