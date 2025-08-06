
"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, DollarSign, User, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import React from "react";
import AccessDenied from "@/components/access-denied";

export default function ClientLayout({
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

  if (userData?.accountType !== 'client') {
      return (
          <AccessDenied 
              title="Access Restricted"
              message="This dashboard is for registered clients only. As a service provider, you should be on the provider dashboard."
              linkHref="/provider/dashboard"
              linkText="Go to Provider Dashboard"
          />
      );
  }

  const menuItems = [
    { href: "/client/dashboard", icon: LayoutDashboard, label: t('dashboard') },
    { href: "/client/payment", icon: DollarSign, label: t('make_payment') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-lg font-semibold text-primary">
              RECOLIXO
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {menuItems.map(item => (
               <Button key={item.href} variant={pathname === item.href ? 'secondary' : 'ghost'} asChild>
                  <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                  </Link>
               </Button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt="Client" />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "Client User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <div className="md:hidden">
                    {menuItems.map(item => (
                       <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}><item.icon className="mr-2 h-4 w-4" /> {item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator/>
                 </div>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
