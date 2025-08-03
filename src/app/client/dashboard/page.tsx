import DashboardCards from "@/components/client/dashboard-cards";
import { DUMMY_CLIENTS } from "@/lib/data";

export default function ClientDashboardPage() {
    // For this prototype, we'll just use the first client's data
    const clientData = DUMMY_CLIENTS[0];

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">Hello, {clientData.name}!</h1>
                <p className="text-muted-foreground">Here is a summary of your EcoCollect service.</p>
            </div>
            <DashboardCards client={clientData} />
        </div>
    );
}
