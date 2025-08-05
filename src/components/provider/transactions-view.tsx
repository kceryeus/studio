
"use client";

import { useState, useMemo } from 'react';
import type { Transaction, TransactionType, TransactionCategory, Client } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useLanguage } from '@/context/language-context';
import { ArrowDown, ArrowUp, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const CategoryBadge = ({ category }: { category: TransactionCategory }) => {
    const variant = {
        'Client Payment': 'secondary',
        'Fuel': 'outline',
        'Salaries': 'outline',
        'Maintenance': 'outline',
        'Other': 'outline',
    }[category] as 'secondary' | 'outline' | 'destructive';
    return (
        <Badge variant={variant} className="capitalize">
            {category}
        </Badge>
    );
}

export default function TransactionsView({ transactions, clients }: { transactions: Transaction[], clients: Client[] }) {
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
    
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => typeFilter === 'all' || tx.type === typeFilter)
            .filter(tx => categoryFilter === 'all' || tx.category === categoryFilter)
            .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, typeFilter, categoryFilter, searchTerm]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const transactionCategories: TransactionCategory[] = ['Client Payment', 'Fuel', 'Salaries', 'Maintenance', 'Other'];

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder={t('search_by_description')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-4">
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('transaction_type')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_types')}</SelectItem>
                            <SelectItem value="income">{t('income')}</SelectItem>
                            <SelectItem value="expense">{t('expense')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('category')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_categories')}</SelectItem>
                            {transactionCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{t(cat as any) || cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('date')}</TableHead>
                            <TableHead>{t('description')}</TableHead>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead className="text-right">{t('amount')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell>{format(new Date(tx.date), 'dd MMM, yyyy')}</TableCell>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell><CategoryBadge category={tx.category} /></TableCell>
                                <TableCell className={`text-right font-semibold flex justify-end items-center gap-1 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    {tx.amount.toFixed(2)} MT
                                </TableCell>
                            </TableRow>
                        ))}
                         {paginatedTransactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                    {t('no_transactions_found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {t('page_x_of_y', { currentPage, totalPages })}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                     <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
