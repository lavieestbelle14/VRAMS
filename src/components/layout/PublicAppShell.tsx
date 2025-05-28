
'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { Home, FileSearch, LogOut, UserCircle, FilePlus2 } from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: '/public/home', label: 'Home', icon: Home, tooltip: 'Home' },
  { href: '/public/apply', label: 'New Application', icon: FilePlus2, tooltip: 'Submit New Application' },
  { href: '/public/track-status', label: 'Track Application Status', icon: FileSearch, tooltip: 'Track Application Status' },
];

export function PublicAppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const logoSrc = "/vrams_logo.png";

  const getAvatarFallback = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return <UserCircle size={20}/>;
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/public/home" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
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
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/public/home' && pathname.startsWith(item.href))}
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
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'VRAMS Public Portal'}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar-silhouette.png" alt="User Avatar" data-ai-hint="person silhouette"/>
                  <AvatarFallback>
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.firstName || user?.username || 'Public User'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
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
