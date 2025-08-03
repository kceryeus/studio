
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();

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
                    <AvatarImage src="https://placehold.co/40x40.png" alt="Client" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@example.com
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
                <DropdownMenuItem asChild>
                    <Link href="/"><LogOut className="mr-2 h-4 w-4" /> {t('logout')}</Link>
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
