
"use client";
import WorkforceList from '@/components/provider/workforce-list';
import { DUMMY_WORKERS, DUMMY_ASSIGNMENTS, DUMMY_VEHICLES } from '@/lib/data';
import ActiveAssignments from '@/components/provider/active-assignments';
import { useLanguage } from '@/context/language-context';

export default function ProviderWorkforcePage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">{t('workforce_management_title')}</h2>
                <p className="text-muted-foreground">{t('workforce_management_subtitle')}</p>
            </div>
            <ActiveAssignments initialAssignments={DUMMY_ASSIGNMENTS} workers={DUMMY_WORKERS} vehicles={DUMMY_VEHICLES} />
            <WorkforceList workers={DUMMY_WORKERS} />
        </div>
    );
}
