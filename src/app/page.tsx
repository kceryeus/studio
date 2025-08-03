import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, User, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-12">
        <Logo className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-primary">
          Welcome to EcoCollect
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          The modern solution for waste management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-full">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline">Service Providers</CardTitle>
                <CardDescription>Manage clients, routes, and payments.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Access your dashboard to track collections, view client information on an interactive map, and manage financials.
            </p>
            <Button asChild className="w-full">
              <Link href="/provider/dashboard">
                Go to Provider Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline">Clients</CardTitle>
                <CardDescription>Track collections and manage payments.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              View your collection schedule, report your garbage status, track your service in real-time, and handle payments easily.
            </p>
            <Button asChild className="w-full">
              <Link href="/client/dashboard">
                Go to Client Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>Copyright © {new Date().getFullYear()} EcoCollect. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
