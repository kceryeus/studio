
"use client";

import { useState, useMemo } from 'react';
import { DUMMY_CLIENTS } from '@/lib/data';
import type { Client, CollectionStatus, PaymentStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, MapPin, CircleDollarSign, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

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


export default function ClientList() {
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<CollectionStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const { t } = useLanguage();

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
        <CardTitle>{t('client_management_title')}</CardTitle>
        <CardDescription>{t('client_management_subtitle')}</CardDescription>
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
                    <span className="text-muted-foreground flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> {t('payment_status')}</span>
                    <PaymentBadge status={client.paymentStatus} />
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('balance')}</span>
                    <span className="font-medium">{client.balance.toFixed(2)} MT</span>
                 </div>
              </CardContent>
            </Card>
          ))}
           {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                {t('no_clients_match_filters')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
