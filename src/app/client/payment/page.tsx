
"use client";
import PaymentForm from "@/components/client/payment-form";
import { DUMMY_CLIENTS } from "@/lib/data";
import { useLanguage } from "@/context/language-context";

export default function ClientPaymentPage() {
    const { t } = useLanguage();
    // For this prototype, we'll just use the first client's data
    const clientData = DUMMY_CLIENTS[0];
    
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
