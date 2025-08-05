
"use client";
import PaymentReports from "@/components/provider/payment-reports";
import { useLanguage } from "@/context/language-context";
import { DUMMY_TRANSACTIONS, DUMMY_CLIENTS } from "@/lib/data";

export default function ProviderPaymentsPage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">{t('payments_reporting_title')}</h2>
                <p className="text-muted-foreground mb-4">{t('payments_reporting_subtitle')}</p>
            </div>
            <PaymentReports transactions={DUMMY_TRANSACTIONS} clients={DUMMY_CLIENTS} />
        </div>
    );
}
