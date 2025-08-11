
"use client";

import type { Client } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CircleDollarSign, Truck, History } from "lucide-react";
import GarbageStatusToggle from "./garbage-status-toggle";
import LocationSharing from "./location-sharing";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/context/language-context";

export default function DashboardCards({ client }: { client: Client | null }) {
  const { t } = useLanguage();

  if (!client) {
    return null;
  }
  
  const hasProvider = !!client.providerId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> {t('service_status')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('next_collection_date')}</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> 
                    {hasProvider ? client.nextCollectionDate : 'N/A'}
                </p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('collection_status_label')}</p>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{client.garbageStatus.replace('-', ' ')}</Badge>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('next_payment_due')}</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4" /> 
                    {hasProvider ? client.nextPaymentDueDate : 'N/A'}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('current_balance')}</p>
                <p className={`text-lg font-semibold ${client.balance > 0 ? 'text-destructive' : ''}`}>
                    {client.balance.toFixed(2)} MT
                </p>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> {t('payment_history')}</CardTitle>
            <CardDescription>{t('payment_history_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.paymentHistory && client.paymentHistory.length > 0 ? client.paymentHistory.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="text-right font-medium">{payment.amount.toFixed(2)} MT</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">{t('no_payment_history')}</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <GarbageStatusToggle initialStatus={client.garbageStatus} client={client} />
        <LocationSharing initialStatus={client.sharesLocation} client={client}/>
      </div>
    </div>
  );
}
