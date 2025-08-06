
"use client"
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
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
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import React from "react";
import AccessDenied from "@/components/access-denied";


export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  React.useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  if (!user) {
    // This state is temporary while the useEffect redirect kicks in.
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Redirecting to login...</p>
        </div>
    );
  }

  if (userData?.accountType !== 'provider') {
      return (
          <AccessDenied 
              title="Access Restricted"
              message="This dashboard is for registered service providers only. As a client, you should be on the client dashboard."
              linkHref="/client/dashboard"
              linkText="Go to Client Dashboard"
          />
      );
  }

  const menuItems = [
    { href: "/provider/dashboard", icon: LayoutDashboard, label: t('dashboard') },
    { href: "/provider/map", icon: Map, label: t('collection_map') },
    { href: "/provider/fleet", icon: Truck, label: t('fleet') },
    { href: "/provider/workforce", icon: Users, label: t('workforce') },
    { href: "/provider/payments", icon: CreditCard, label: t('payments') },
    { href: "/provider/subscribe", icon: BadgeDollarSign, label: t('subscription') },
  ];

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
            {menuItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: item.label, side: "right" }}
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png" } alt="Provider" />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium">{user.displayName || "Provider Inc."}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
             <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link href="/">
                    <Home />
                    <span>{t('home_page')}</span>
                </Link>
             </Button>
             <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
                <LogOut />
                <span>{t('logout')}</span>
             </Button>
          </div>
           <div className="flex items-center justify-center gap-2 mt-2 group-data-[collapsible=icon]:flex-col">
              <ThemeToggle />
              <LanguageToggle />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b h-16">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">{menuItems.find(item => item.href === pathname)?.label || t('provider_dashboard')}</h1>
        </header>
        <main className="p-4 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
