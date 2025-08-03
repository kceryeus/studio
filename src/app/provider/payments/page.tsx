
"use client";
import PaymentReports from "@/components/provider/payment-reports";
import { useLanguage } from "@/context/language-context";

export default function ProviderPaymentsPage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">{t('payments_reporting_title')}</h2>
            <p className="text-muted-foreground mb-4">{t('payments_reporting_subtitle')}</p>
            <PaymentReports />
        </div>
    );
}
