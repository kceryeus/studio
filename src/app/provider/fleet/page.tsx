
"use client";
import FleetList from '@/components/provider/fleet-list';
import { DUMMY_VEHICLES } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function ProviderFleetPage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">{t('fleet_management_title')}</h2>
                <p className="text-muted-foreground">{t('fleet_management_subtitle')}</p>
            </div>
            <FleetList vehicles={DUMMY_VEHICLES} />
        </div>
    );
}
