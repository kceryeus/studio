
"use client";
import DashboardCards from "@/components/client/dashboard-cards";
import { DUMMY_CLIENTS } from "@/lib/data";
import { useLanguage } from "@/context/language-context";

export default function ClientDashboardPage() {
    const { t } = useLanguage();
    // For this prototype, we'll just use the first client's data
    const clientData = DUMMY_CLIENTS[0];

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
