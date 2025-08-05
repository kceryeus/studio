
"use client";

import { useState, useMemo } from 'react';
import { DUMMY_CLIENTS, DUMMY_TRANSACTIONS, DUMMY_ROUTES } from '@/lib/data';
import type { Client, CollectionStatus, PaymentStatus, Transaction, Route } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, MapPin, CircleDollarSign, ShieldCheck, ShieldAlert, FileText, Settings, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=xQ1eFBidgVoYA8BIrNEu`;

const StatusBadge = ({ status }: { status: 'active' | 'suspended' }) => {
    const { t } = useLanguage();
  return (
    <Badge variant={status === 'active' ? 'default' : 'destructive'} className="capitalize bg-opacity-20 text-opacity-100 border-opacity-30">
        {status === 'active' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
        {t(status)}
    </Badge>
  );
};

const PaymentBadge = ({ status }: { status: 'paid' | 'due' | 'overdue' }) => {
    const { t } = useLanguage();
  const variant = {
    paid: 'secondary',
    due: 'outline',
    overdue: 'destructive',
  }[status] as 'secondary' | 'outline' | 'destructive';
  return (
    <Badge variant={variant} className="capitalize">
      {t(status)}
    </Badge>
  );
};

const initialNewClientState = {
  id: '',
  name: '',
  address: '',
  coordinates: { lat: -25.965, lng: 32.583 },
  collectionStatus: 'active' as CollectionStatus,
  paymentStatus: 'due' as PaymentStatus,
  garbageStatus: 'pending' as any,
  nextCollectionDate: '',
  nextPaymentDueDate: '',
  paymentHistory: [],
  balance: 0,
  sharesLocation: true,
  routeId: null
};


export default function ClientList() {
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<CollectionStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Client>(initialNewClientState);

  const { t } = useLanguage();
  const { toast } = useToast();

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = collectionFilter === 'all' || client.collectionStatus === collectionFilter;
      const matchesPayment = paymentFilter === 'all' || client.paymentStatus === paymentFilter;
      return matchesSearch && matchesCollection && matchesPayment;
    });
  }, [clients, searchTerm, collectionFilter, paymentFilter]);

  const clientTransactions = useMemo(() => {
    if (!selectedClient) return [];
    return DUMMY_TRANSACTIONS.filter(tx => tx.description.includes(selectedClient.id));
  }, [selectedClient]);

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setEditingClient({...client});
  }

  const handleCloseDialog = () => {
    setSelectedClient(null);
    setEditingClient(null);
  }

  const handleSaveChanges = () => {
    if (!editingClient || !editingClient.id) return;

    setClients(prevClients => 
      prevClients.map(c => c.id === editingClient.id ? { ...c, ...editingClient } as Client : c)
    );
    
    toast({
        title: "Client Updated",
        description: `Successfully updated ${editingClient.name}'s details.`,
    });

    handleCloseDialog();
  }

  const handleAddClient = () => {
    const clientToAdd = {
        ...newClient,
        id: `CLI${Date.now()}`,
    };
    setClients(prev => [...prev, clientToAdd]);
    toast({
        title: "Client Added",
        description: `Successfully added ${clientToAdd.name}.`,
    });
    setIsAddClientModalOpen(false);
    setNewClient(initialNewClientState);
  };

  const onNewClientMapClick = (e: any) => {
    setNewClient(prev => ({...prev, coordinates: e.lngLat}));
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t('client_management_title')}</CardTitle>
              <CardDescription>{t('client_management_subtitle')}</CardDescription>
            </div>
            <Button onClick={() => setIsAddClientModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Input 
              placeholder={t('search_by_name_or_address')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-4">
              <Select value={collectionFilter} onValueChange={(value) => setCollectionFilter(value as CollectionStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('collection_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_collection_status')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="suspended">{t('suspended')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('payment_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_payment_status')}</SelectItem>
                  <SelectItem value="paid">{t('paid')}</SelectItem>
                  <SelectItem value="due">{t('due')}</SelectItem>
                  <SelectItem value="overdue">{t('overdue')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('client')}</TableHead>
                            <TableHead className="hidden md:table-cell">{t('address')}</TableHead>
                            <TableHead>{t('collection_status')}</TableHead>
                            <TableHead>{t('payment_status')}</TableHead>
                            <TableHead className="text-right">{t('balance')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.map(client => (
                            <TableRow key={client.id} onClick={() => handleRowClick(client)} className="cursor-pointer">
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">{client.address}</TableCell>
                                <TableCell>
                                    <StatusBadge status={client.collectionStatus} />
                                </TableCell>
                                <TableCell>
                                    <PaymentBadge status={client.paymentStatus} />
                                </TableCell>
                                <TableCell className="text-right font-semibold">{client.balance.toFixed(2)} MT</TableCell>
                            </TableRow>
                        ))}
                         {filteredClients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    {t('no_clients_match_filters')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <MapPin className="w-4 h-4" /> {selectedClient?.address}
            </div>
          </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                <div className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Account Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                                <Label htmlFor="collection-status-select">Collection Status</Label>
                                <Select 
                                    value={editingClient?.collectionStatus}
                                    onValueChange={(value) => setEditingClient(prev => prev ? {...prev, collectionStatus: value as CollectionStatus} : null)}
                                >
                                    <SelectTrigger id="collection-status-select">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> {t('transaction_history')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('date')}</TableHead>
                                    <TableHead>{t('description')}</TableHead>
                                    <TableHead className="text-right">{t('amount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{format(new Date(tx.date), 'dd MMM, yyyy')}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">{tx.amount.toFixed(2)} MT</TableCell>
                                    </TableRow>
                                ))}
                                {clientTransactions.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            {t('no_transactions_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>{t('cancel')}</Button>
            <Button onClick={handleSaveChanges}>{t('save_changes')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Client Dialog */}
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="max-w-4xl">
           <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Fill in the client's details and set their location on the map.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-client-name">Full Name</Label>
                        <Input id="new-client-name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-client-address">Address</Label>
                        <Input id="new-client-address" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-client-route">Assign to Route</Label>
                        <Select value={newClient.routeId || ''} onValueChange={value => setNewClient({...newClient, routeId: value})}>
                           <SelectTrigger id="new-client-route">
                                <SelectValue placeholder="Select a route" />
                           </SelectTrigger>
                           <SelectContent>
                                {DUMMY_ROUTES.map(route => (
                                    <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                                ))}
                           </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Set Location</Label>
                    <div className="h-64 w-full rounded-md overflow-hidden relative">
                        <Map
                           initialViewState={{
                                longitude: newClient.coordinates.lng,
                                latitude: newClient.coordinates.lat,
                                zoom: 12,
                            }}
                            mapStyle={MAPTILER_STYLE_URL}
                            style={{width: '100%', height: '100%'}}
                            mapLib={import('maplibre-gl')}
                            onClick={onNewClientMapClick}
                            cursor="crosshair"
                        >
                            <Marker longitude={newClient.coordinates.lng} latitude={newClient.coordinates.lat}>
                                <MapPin className="text-primary w-8 h-8 drop-shadow-lg" />
                            </Marker>
                        </Map>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddClientModalOpen(false)}>{t('cancel')}</Button>
                <Button onClick={handleAddClient} disabled={!newClient.name || !newClient.address}>Add Client</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
