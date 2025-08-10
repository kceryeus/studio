"use client";
import React, { useEffect, useState } from 'react';
import PaymentForm from "@/components/client/payment-form";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import type { Client } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        if (!user) {
            setLoading(false);
            return;
        };

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
             console.error("Error fetching client data for payment:", err);
             setClientData(null);
             setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!clientData || !clientData.providerId) {
         return (
             <div className="max-w-2xl mx-auto">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">{t('make_a_payment_title')}</h1>
                    <p className="text-muted-foreground">{t('make_a_payment_subtitle')}</p>
                </div>
                 <Card className="mt-6">
                     <CardHeader>
                         <CardTitle>Unable to Load Payment Form</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p>You must have an active service provider to make a payment.</p>
                     </CardContent>
                 </Card>
            </div>
         )
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
