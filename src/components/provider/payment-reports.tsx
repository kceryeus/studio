
"use client";

import { useMemo } from 'react';
import type { Transaction, Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Line, ComposedChart } from 'recharts';
import { subMonths, format, startOfMonth } from 'date-fns';
import { useLanguage } from '@/context/language-context';
import TransactionsView from './transactions-view';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';

export default function PaymentReports({ transactions, clients }: { transactions: Transaction[], clients: Client[] }) {
    const { t } = useLanguage();

    const { totalRevenue, totalCosts, netProfit, chartData } = useMemo(() => {
        let revenue = 0;
        let costs = 0;

        const monthlyData: { [key: string]: { revenue: number, costs: number } } = {};

        transactions.forEach(tx => {
            const month = format(startOfMonth(new Date(tx.date)), 'MMM yyyy');
            if (!monthlyData[month]) {
                monthlyData[month] = { revenue: 0, costs: 0 };
            }

            if (tx.type === 'income') {
                revenue += tx.amount;
                monthlyData[month].revenue += tx.amount;
            } else {
                costs += tx.amount;
                monthlyData[month].costs += tx.amount;
            }
        });
        
        const sortedMonths = Object.keys(monthlyData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
        const last6Months = sortedMonths.slice(-6);

        const chartData = last6Months.map(month => ({
            month: month.split(' ')[0],
            Revenue: monthlyData[month].revenue,
            Costs: monthlyData[month].costs,
        }));

        return {
            totalRevenue: revenue,
            totalCosts: costs,
            netProfit: revenue - costs,
            chartData
        };
    }, [transactions]);

    const chartConfig = {
      Revenue: {
        label: t('revenue_overview'),
        color: 'hsl(var(--chart-1))',
      },
      Costs: {
        label: t('total_costs'),
        color: 'hsl(var(--destructive))',
      },
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('total_revenue')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} MT</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('total_costs')}</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCosts.toFixed(2)} MT</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('net_profit')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                            {netProfit.toFixed(2)} MT
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('financial_overview')}</CardTitle>
                    <CardDescription>{t('financial_overview_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                        <ComposedChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="var(--color-Revenue)" radius={4} />
                            <Line type="monotone" dataKey="Costs" stroke="var(--color-Costs)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {t('transaction_history')}</CardTitle>
                    <CardDescription>{t('transaction_history_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionsView transactions={transactions} clients={clients} />
                </CardContent>
            </Card>
        </div>
    );
}
