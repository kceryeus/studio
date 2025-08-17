
"use client";
import React, { useEffect, useState } from 'react';
import ClientList from '@/components/provider/client-list';
import RoutesManager from '@/components/provider/routes-manager';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, Truck, AlertCircle, Info, Loader2, PlusCircle, Phone, MapPin, Route as RouteIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client, Route } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatPhoneNumber, isValidMozambiquePhone } from '@/lib/utils';

export default function ProviderDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    phone: '',
    address: '',
    balance: '0'
  });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };
    
    // Fetch clients
    const clientsQuery = query(collection(db, "clients"), where("providerId", "==", user.uid));
    const clientsUnsubscribe = onSnapshot(clientsQuery, (querySnapshot) => {
        const clientsData: Client[] = [];
        querySnapshot.forEach((doc) => {
            clientsData.push({ id: doc.id, ...doc.data() } as Client);
        });
        setClients(clientsData);
    }, (error) => {
        console.error("Error fetching clients for dashboard: ", error);
    });

    // Fetch routes
    const routesQuery = query(collection(db, "routes"), where("providerId", "==", user.uid));
    const routesUnsubscribe = onSnapshot(routesQuery, (querySnapshot) => {
        const routesData: Route[] = [];
        querySnapshot.forEach((doc) => {
            routesData.push({ id: doc.id, ...doc.data() } as Route);
        });
        setRoutes(routesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching routes for dashboard: ", error);
        setLoading(false);
    });

    return () => {
        clientsUnsubscribe();
        routesUnsubscribe();
    };
  }, [user]);

  const totalClients = clients.length;
  const activeCollections = clients.filter(c => c.garbageStatus === 'out').length;
  const issues = clients.filter(c => c.paymentStatus === 'overdue' || c.collectionStatus === 'suspended').length;
  const unlinkedClients = clients.filter(c => !c.userId).length;
  const linkedClients = clients.filter(c => !!c.userId).length;
  const activeRoutes = routes.filter(r => r.isActive).length;
  const totalRoutePoints = routes.reduce((sum, route) => sum + route.points.length, 0);

  const handleQuickAddClient = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    
    if (!quickAddForm.name || !quickAddForm.phone) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Name and phone number are required.' });
      return;
    }

    // Validate phone number format
    if (!isValidMozambiquePhone(quickAddForm.phone)) {
      toast({ 
        variant: 'destructive', 
        title: 'Invalid Phone Number', 
        description: 'Please enter a valid 9-digit phone number starting with 8 or 9' 
      });
      return;
    }

    const clientToAdd = {
      name: quickAddForm.name,
      phone: formatPhoneNumber(quickAddForm.phone), // Format phone number
      address: quickAddForm.address || null,
      email: null,
      coordinates: null,
      collectionStatus: 'active' as const,
      paymentStatus: 'due' as const,
      garbageStatus: 'pending' as const,
      nextCollectionDate: null,
      nextPaymentDueDate: null,
      paymentHistory: [],
      balance: parseFloat(quickAddForm.balance) || 0,
      sharesLocation: false,
      routeId: null,
      userId: null, // Unlinked by default
      providerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "clients"), clientToAdd);
      toast({
        title: "Client Added Successfully",
        description: `${quickAddForm.name} has been added to your client list.`,
      });
      setIsQuickAddModalOpen(false);
      setQuickAddForm({ name: '', phone: '', address: '', balance: '0' });
    } catch (error) {
      console.error("Error adding client: ", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Client",
        description: "Could not save client data. Please try again."
      });
    }
  };

  const resetQuickAddForm = () => {
    setQuickAddForm({ name: '', phone: '', address: '', balance: '0' });
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-accent border-accent-foreground/20">
        <CardContent className="p-4 flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Info className="h-6 w-6 text-accent-foreground" />
                <p className="text-sm text-accent-foreground">
                    {t('trial_period_message')} 
                    <Link href="/provider/subscribe" className="underline font-semibold ml-1">{t('view_subscription_plans')}</Link>
                </p>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10" asChild>
                <Link href="https://paysuite.tech/checkout/c3fe5a91-78ea-4ddc-8d92-e9de67dcceb9" target="_blank">
                    {t('subscribe_now')}
                </Link>
            </Button>
        </CardContent>
      </Card>

      {/* Quick Add Client Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Quick Add Client
              </CardTitle>
              <CardDescription>
                Add a new client quickly with just essential information. You can add more details later.
              </CardDescription>
            </div>
            <Button onClick={() => setIsQuickAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_clients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{totalClients}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Clients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-green-600">{linkedClients}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_collections_today')}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{activeCollections}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <RouteIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-blue-600">{activeRoutes}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('clients_with_issues')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold text-destructive">{issues}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Client Modal */}
      <Dialog open={isQuickAddModalOpen} onOpenChange={setIsQuickAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Client</DialogTitle>
            <DialogDescription>
              Add a new client with essential information. Phone number will be used for future M-Pesa/e-Mola payments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-name">Full Name *</Label>
              <Input 
                id="quick-name" 
                value={quickAddForm.name} 
                onChange={e => setQuickAddForm(prev => ({...prev, name: e.target.value}))}
                placeholder="Client's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-phone">Phone Number *</Label>
              <Input 
                id="quick-phone" 
                value={quickAddForm.phone} 
                onChange={e => setQuickAddForm(prev => ({...prev, phone: e.target.value}))}
                placeholder="846784911"
              />
              {quickAddForm.phone && !isValidMozambiquePhone(quickAddForm.phone) && (
                <p className="text-xs text-destructive">
                  Please enter a valid 9-digit phone number starting with 8 or 9
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-address">Address (Optional)</Label>
              <Input 
                id="quick-address" 
                value={quickAddForm.address} 
                onChange={e => setQuickAddForm(prev => ({...prev, address: e.target.value}))}
                placeholder="Client's address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-balance">Initial Balance (MT)</Label>
              <Input 
                id="quick-balance" 
                type="number" 
                value={quickAddForm.balance} 
                onChange={e => setQuickAddForm(prev => ({...prev, balance: e.target.value}))}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetQuickAddForm}>Reset</Button>
            <Button onClick={handleQuickAddClient} disabled={!quickAddForm.name || !quickAddForm.phone}>
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Routes Management */}
      <RoutesManager clients={clients} />

      {/* Client Management */}
      <ClientList />
    </div>
  );
}
