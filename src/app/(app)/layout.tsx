"use client"

import {
  FileText,
  MessageCircle,
  ScanSearch,
  Users,
  PanelLeft,
  Home as HomeIcon,
  History,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppHeader } from "@/components/legal-clarity-ai/app-header";
import { UserProfileButton } from "@/components/legal-clarity-ai/user-profile-button";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-headline font-semibold">Menu</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" isActive={true}>
                  <HomeIcon />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/history">
                  <History />
                  History
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <UserProfileButton />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="text-center p-4 text-sm text-muted-foreground no-print">
              <p>Legal Clarity AI. Your AI-powered legal assistant.</p>
            </footer>
          </div>
        </SidebarInset>
    </>
  );
}
