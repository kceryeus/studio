"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, User, Calendar } from 'lucide-react';

const paymentSchema = z.object({
    amount: z.coerce.number().min(1, { message: 'Amount must be at least 1 MT.' }),
    cardNumber: z.string().length(16, { message: 'Card number must be 16 digits.' }).regex(/^\d+$/, { message: "Card number must be digits only." }),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry must be in MM/YY format.' }),
    cvc: z.string().length(3, { message: 'CVC must be 3 digits.' }).regex(/^\d+$/, { message: "CVC must be digits only."}),
    cardholderName: z.string().min(2, { message: 'Cardholder name is required.' }),
});

export default function PaymentForm({ client }: { client: Client }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: client.balance > 0 ? client.balance : 25.00,
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            cardholderName: client.name,
        },
    });

    function onSubmit(values: z.infer<typeof paymentSchema>) {
        console.log(values);
        toast({
            title: 'Payment Successful',
            description: `Your payment of ${values.amount.toFixed(2)} MT has been processed.`,
        });
        form.reset({
            ...form.getValues(),
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            amount: 0,
        });
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter your payment information below. Your current balance is <span className="font-bold text-primary">{client.balance.toFixed(2)} MT</span>.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Amount (MT)</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                           <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">MT</span>
                                           <Input type="number" step="0.01" {...field} className="pl-10" />
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="cardholderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cardholder Name</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                           <Input placeholder="John Doe" {...field} className="pl-8" />
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                           <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                           <Input placeholder="0000 0000 0000 0000" {...field} className="pl-8" />
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                               <Input placeholder="MM/YY" {...field} className="pl-8" />
                                           </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cvc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CVC</FormLabel>
                                        <FormControl>
                                           <div className="relative">
                                               <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                               <Input placeholder="123" {...field} className="pl-8" />
                                           </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                       </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
