"use client";

import { useState, useMemo } from 'react';
import { DUMMY_CLIENTS } from '@/lib/data';
import type { Client, CollectionStatus, PaymentStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, MapPin, CircleDollarSign, ShieldCheck, ShieldAlert } from 'lucide-react';

const StatusBadge = ({ status }: { status: 'active' | 'suspended' }) => {
  return (
    <Badge variant={status === 'active' ? 'default' : 'destructive'} className="capitalize bg-opacity-20 text-opacity-100 border-opacity-30">
        {status === 'active' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
        {status}
    </Badge>
  );
};

const PaymentBadge = ({ status }: { status: 'paid' | 'due' | 'overdue' }) => {
  const variant = {
    paid: 'secondary',
    due: 'outline',
    overdue: 'destructive',
  }[status] as 'secondary' | 'outline' | 'destructive';
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
};


export default function ClientList() {
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<CollectionStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = collectionFilter === 'all' || client.collectionStatus === collectionFilter;
      const matchesPayment = paymentFilter === 'all' || client.paymentStatus === paymentFilter;
      return matchesSearch && matchesCollection && matchesPayment;
    });
  }, [clients, searchTerm, collectionFilter, paymentFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Management</CardTitle>
        <CardDescription>View, filter, and manage your clients.</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <Input 
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-4">
            <Select value={collectionFilter} onValueChange={(value) => setCollectionFilter(value as CollectionStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Collection Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collection Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" /> {client.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" />{client.address}</CardDescription>
                    </div>
                    <StatusBadge status={client.collectionStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Payment Status</span>
                    <PaymentBadge status={client.paymentStatus} />
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-medium">${client.balance.toFixed(2)}</span>
                 </div>
              </CardContent>
            </Card>
          ))}
           {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No clients match the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
