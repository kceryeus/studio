import WorkforceList from '@/components/provider/workforce-list';
import { DUMMY_WORKERS } from '@/lib/data';

export default function ProviderWorkforcePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Workforce Management</h2>
                <p className="text-muted-foreground">Manage your drivers, pickers, and other operational staff.</p>
            </div>
            <WorkforceList workers={DUMMY_WORKERS} />
        </div>
    );
}
