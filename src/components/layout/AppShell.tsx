
'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Files, LogOut, UserCircle } from 'lucide-react'; // Removed Settings
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
  { href: '/dashboard/applications', label: 'All Applications', icon: Files, tooltip: 'All Applications' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // Ensure pathname is defined
  const logoSrc = "/vrams_logo.png"; 
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const getAvatarFallback = () => {
    if (user?.role === 'officer') return "EO";
    if (user?.username) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return <UserCircle size={20} />;
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="z-40"> {/* Ensure sidebar is on top */}
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Image
              src={logoSrc}
              alt="VRAMS official seal"
              width={32}
              height={32}
              data-ai-hint="VRAMS official seal"
            />
            <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">VRAMS</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    tooltip={item.tooltip}
                    asChild={false}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           {/* Placeholder for potential footer items */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
             <SidebarTrigger />
             <h1 className="text-lg font-semibold hidden sm:block">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'VRAMS Portal'}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar-silhouette.png" alt="User Avatar" data-ai-hint="person silhouette" />
                  <AvatarFallback>
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.username || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === 'public' && (
                <DropdownMenuItem onClick={() => router.push('/public/profile')}>Profile</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
