
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
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        };

        const fetchClientData = async () => {
            setLoading(true);
            setError(null);
            const q = query(collection(db, "clients"), where("userId", "==", user.uid));
            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setClientData(clientFromDoc(doc));
                } else {
                    setClientData(null);
                }
            } catch (err) {
                 console.error("Error fetching client data for payment:", err);
                 setError("Could not load payment information. Please ensure you have an active service provider.");
            } finally {
                setLoading(false);
            }
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
    
    if (error || !clientData) {
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
                         <p>{error || "You must have an active service provider to make a payment."}</p>
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
