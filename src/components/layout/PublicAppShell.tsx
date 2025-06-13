'use client';
import React, { useState } from 'react';
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
import { Home, FileSearch, LogOut, UserCircle, FilePlus2, Settings, HelpCircle, Search as SearchIcon } from 'lucide-react';
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
  { href: '/public/faq', label: 'FAQ / Help', icon: HelpCircle, tooltip: 'Frequently Asked Questions' },
];

// This mapping is still useful for page-specific titles if needed elsewhere,
// but the icon won't be shown in the header bar.
const pageTitleDetails: Record<string, { title: string; icon?: React.ElementType }> = {
  '/public/home': { title: 'Home', icon: Home },
  '/public/apply': { title: 'New Voter Application', icon: FilePlus2 },
  '/public/track-status': { title: 'Track Application Status', icon: SearchIcon },
  '/public/faq': { title: 'FAQ / Help Center', icon: HelpCircle },
  '/public/profile': { title: 'My Profile', icon: Settings },
  '/public/application-submitted': { title: 'Application Submitted', icon: FilePlus2 },
  '/public/schedule-biometrics': { title: 'Schedule Biometrics', icon: FilePlus2 },
};


export function PublicAppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const logoSrc = "/vrams_logo.png"; 



  const getAvatarFallback = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return <UserCircle size={20}/>;
  };

  const getCurrentPageTitle = () => {
    // Find a direct match or a startsWith match for dynamic routes like /application-submitted/[id]
    const matchedPath = Object.keys(pageTitleDetails).find(
      key => pathname === key || (key.includes('[') && pathname.startsWith(key.split('[')[0]))
    );

    if (matchedPath && pageTitleDetails[matchedPath]) {
      return pageTitleDetails[matchedPath].title;
    }
    
    // Fallback for nav items if no specific title detail found
    const currentNavItem = navItems.find(item => pathname === item.href || (item.href !== '/public/home' && pathname.startsWith(item.href)));
    return currentNavItem?.label || 'VRAMS Public Portal';
  };

  const pageTitle = getCurrentPageTitle();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="z-40"> {/* Ensure sidebar is on top */}
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
                <Link href={item.href}>
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
              {/* Icon removed from here */}
              {pageTitle}
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
              <DropdownMenuLabel>{user?.username || 'Public User'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/public/profile" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout()}>
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
