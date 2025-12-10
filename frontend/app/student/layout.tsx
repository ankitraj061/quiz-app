'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, History, LogOut, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const menuItems = [
  { title: 'Dashboard', url: '/student/dashboard', icon: Home },
  { title: 'History', url: '/student/history', icon: History },
];

function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
    router.push('/auth/student/login');
  };

  return (
    <Sidebar 
      className={`${isCollapsed ? 'w-14' : 'w-64'} bg-card border-r border-border`} 
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header Section with Brand */}
        {!isCollapsed && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  QuizMaster
                </h1>
                <p className="text-xs text-muted-foreground">Student Portal</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Collapsed Header */}
        {isCollapsed && (
          <div className="py-3 border-b border-border flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupContent className="py-4">
            <SidebarMenu>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-primary/10 text-primary font-medium shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </ul>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Section with Logout Confirmation */}
        <SidebarGroup className='mt-auto py-4 border-t'>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer`}
                    >
                      <LogOut className="w-5 h-5" />
                      {!isCollapsed && <span>Logout</span>}
                    </SidebarMenuButton>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end your current session and you will need to login again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        Yes, Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-4">
            <SidebarTrigger />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
