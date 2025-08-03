import FleetList from '@/components/provider/fleet-list';
import { DUMMY_VEHICLES } from '@/lib/data';

export default function ProviderFleetPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Fleet Management</h2>
                <p className="text-muted-foreground">Register, track, and manage your fleet of collection vehicles.</p>
            </div>
            <FleetList vehicles={DUMMY_VEHICLES} />
        </div>
    );
}
