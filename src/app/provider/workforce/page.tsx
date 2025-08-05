
"use client";
import WorkforceList from '@/components/provider/workforce-list';
import { DUMMY_WORKERS, DUMMY_ASSIGNMENTS, DUMMY_VEHICLES, DUMMY_ROUTES } from '@/lib/data';
import AssignmentManager from '@/components/provider/assignment-manager';
import { useLanguage } from '@/context/language-context';

export default function ProviderWorkforcePage() {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">{t('workforce_management_title')}</h2>
                <p className="text-muted-foreground">{t('workforce_management_subtitle')}</p>
            </div>
            <AssignmentManager 
                initialAssignments={DUMMY_ASSIGNMENTS} 
                workers={DUMMY_WORKERS} 
                vehicles={DUMMY_VEHICLES}
                routes={DUMMY_ROUTES}
            />
            <WorkforceList workers={DUMMY_WORKERS} />
        </div>
    );
}
