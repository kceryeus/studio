import ClientList from '@/components/provider/client-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Truck, AlertCircle, Info } from 'lucide-react';
import { DUMMY_CLIENTS } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProviderDashboardPage() {
  const totalClients = DUMMY_CLIENTS.length;
  const activeCollections = DUMMY_CLIENTS.filter(c => c.garbageStatus === 'out').length;
  const issues = DUMMY_CLIENTS.filter(c => c.paymentStatus === 'overdue' || c.collectionStatus === 'suspended').length;
  
  return (
    <div className="space-y-6">
      <Card className="bg-accent border-accent-foreground/20">
        <CardContent className="p-4 flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Info className="h-6 w-6 text-accent-foreground" />
                <p className="text-sm text-accent-foreground">
                    You are currently on the free trial period. 
                    <Link href="#" className="underline font-semibold ml-1">View subscription plans.</Link>
                </p>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10">Subscribe Now</Button>
        </CardContent>
      </Card>
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
