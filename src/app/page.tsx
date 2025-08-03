"use client"
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, User, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/context/language-context';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="text-center mb-12">
        <Logo className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-primary">
          {t('welcome_to_recolixo')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('modern_solution_for_waste_management')}
        </p>
      </div>

       <div className="flex gap-4 mb-12">
          <Button asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">{t('sign_up')}</Link>
          </Button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-full">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline">{t('service_providers')}</CardTitle>
                <CardDescription>{t('manage_clients_routes_and_payments')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              {t('provider_description')}
            </p>
            <Button asChild className="w-full">
              <Link href="/provider/dashboard">
                {t('go_to_provider_dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
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
                <CardTitle className="text-2xl font-headline">{t('clients')}</CardTitle>
                <CardDescription>{t('track_collections_and_manage_payments')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              {t('client_description')}
            </p>
            <Button asChild className="w-full">
              <Link href="/client/dashboard">
                {t('go_to_client_dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>Copyright © {new Date().getFullYear()} RECOLIXO. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
