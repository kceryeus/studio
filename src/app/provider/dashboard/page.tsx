import ClientList from '@/components/provider/client-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Truck, AlertCircle } from 'lucide-react';
import { DUMMY_CLIENTS } from '@/lib/data';

export default function ProviderDashboardPage() {
  const totalClients = DUMMY_CLIENTS.length;
  const activeCollections = DUMMY_CLIENTS.filter(c => c.garbageStatus === 'out').length;
  const issues = DUMMY_CLIENTS.filter(c => c.paymentStatus === 'overdue' || c.collectionStatus === 'suspended').length;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collections Today</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients with Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{issues}</div>
          </CardContent>
        </Card>
      </div>
      <ClientList />
    </div>
  );
}
