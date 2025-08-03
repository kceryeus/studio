"use client";

import { useMemo } from 'react';
import { DUMMY_CLIENTS } from '@/lib/data';
import type { Client, PaymentStatus } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { subMonths, format, startOfMonth } from 'date-fns';

const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
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

export default function PaymentReports() {
    
    const chartData = useMemo(() => {
        const data = Array.from({ length: 6 }).map((_, i) => {
            const month = subMonths(new Date(), 5 - i);
            return {
                month: format(month, 'MMM'),
                year: format(month, 'yyyy'),
                total: 0,
            };
        });

        DUMMY_CLIENTS.forEach(client => {
            client.paymentHistory.forEach(payment => {
                const paymentMonth = format(startOfMonth(new Date(payment.date)), 'MMM');
                const paymentYear = format(new Date(payment.date), 'yyyy');
                const monthEntry = data.find(d => d.month === paymentMonth && d.year === paymentYear);
                if (monthEntry) {
                    monthEntry.total += payment.amount;
                }
            });
        });

        // Add some random data for better visualization
        data[2].total += 50; data[3].total += 25; data[4].total += 75;

        return data;
    }, []);

    const chartConfig = {
      total: {
        label: 'Total',
        color: 'hsl(var(--primary))',
      },
    };

    const totalBalanceDue = DUMMY_CLIENTS.reduce((acc, client) => acc + client.balance, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Client Payment Status</CardTitle>
                <CardDescription>Detailed overview of all client payments and balances.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead>Next Due Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {DUMMY_CLIENTS.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell><PaymentBadge status={client.paymentStatus} /></TableCell>
                                <TableCell className="text-right">{client.balance.toFixed(2)} MT</TableCell>
                                <TableCell>{client.collectionStatus === 'suspended' ? 'N/A' : client.nextPaymentDueDate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue from paid invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                tickFormatter={(value) => `${value} MT`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total Outstanding Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-destructive">{totalBalanceDue.toFixed(2)} MT</p>
                    <p className="text-xs text-muted-foreground">Across all clients with due or overdue payments.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
