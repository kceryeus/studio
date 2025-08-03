
"use client"
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Map,
  CreditCard,
  LogOut,
  Home,
  Truck,
  Users,
  BadgeDollarSign
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/context/language-context";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
              RECOLIXO
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('dashboard'), side: "right" }}
              >
                <Link href="/provider/dashboard">
                  <LayoutDashboard />
                  <span>{t('dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('collection_map'), side: "right" }}
              >
                <Link href="/provider/map">
                  <Map />
                  <span>{t('collection_map')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('fleet'), side: "right" }}
              >
                <Link href="/provider/fleet">
                  <Truck />
                  <span>{t('fleet')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('workforce'), side: "right" }}
              >
                <Link href="/provider/workforce">
                  <Users />
                  <span>{t('workforce')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('payments'), side: "right" }}
              >
                <Link href="/provider/payments">
                  <CreditCard />
                  <span>{t('payments')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: t('subscription'), side: "right" }}
              >
                <Link href="/provider/subscribe">
                  <BadgeDollarSign />
                  <span>{t('subscription')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="Provider" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium">Provider Inc.</span>
              <span className="text-xs text-muted-foreground">provider@eco.co</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
             <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link href="/">
                    <Home />
                    <span>{t('home_page')}</span>
                </Link>
             </Button>
             <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10" asChild>
                <Link href="/">
                    <LogOut />
                    <span>{t('logout')}</span>
                </Link>
             </Button>
          </div>
           <div className="flex items-center justify-center gap-2 mt-2 group-data-[collapsible=icon]:flex-col">
              <ThemeToggle />
              <LanguageToggle />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">{t('provider_dashboard')}</h1>
        </header>
        <main className="p-4 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
