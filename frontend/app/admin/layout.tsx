// import Sidebar from './/Sidebar';

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex">
//       {/* Make Sidebar fixed */}
//       <div className="fixed left-0 top-0 h-screen w-64">
//         <Sidebar />
//       </div>

//       {/* Page content with margin-left */}
//       <main className="ml-64 flex-1 h-screen overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   );
// }

"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  LogOut,
  UserPlus,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { changeAdminPassword, verifyAdminPassword } from "@/app/lib/adminApi";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Create Quiz", url: "/admin/create", icon: PlusCircle },
];

function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const isCollapsed = state === "collapsed";

  // Reset Password State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<"verify" | "change">("verify");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/student/login");
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("verify");
  };

  const handleVerifyPassword = async () => {
    try {
      setLoading(true);
      await verifyAdminPassword(currentPassword);
      setStep("change");
      toast.success("Password verified");
    } catch (err: any) {
      toast.error(err?.message || "Current password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      setLoading(true);
      await changeAdminPassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar
      className={`${
        isCollapsed ? "w-14" : "w-64"
      } bg-card border-r border-border`}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header Section with Brand */}
        {!isCollapsed && (
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">QuizMaster</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Header */}
        {isCollapsed && (
          <div className="py-3 border-b border-border flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
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
                              ? "bg-primary/10 text-primary font-medium shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
        <SidebarGroup className="mt-auto py-4 border-t">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer`}
                >
                  <Link href="/admin/add-admin">
                    <UserPlus className="w-5 h-5" />
                    {!isCollapsed && <span>Add Admin</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                      <AlertDialogTitle>
                        Are you sure you want to logout?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end your current session and you will need to
                        login again.
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

              {/* Reset Password Button */}
              <SidebarMenuItem>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer`}
                    >
                      <KeyRound className="w-5 h-5" />
                      {!isCollapsed && <span>Reset Password</span>}
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        {step === "verify"
                          ? "Enter your current password to continue."
                          : "Set your new password."}
                      </DialogDescription>
                    </DialogHeader>

                    {step === "verify" ? (
                      <div className="space-y-6 py-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-foreground block">
                            Current Password
                          </label>
                          <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="h-10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 py-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-foreground block">
                            New Password
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-foreground block">
                            Confirm Password
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      {step === "verify" ? (
                        <Button
                          onClick={handleVerifyPassword}
                          disabled={loading || !currentPassword}
                        >
                          {loading ? "Checking..." : "Next"}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleChangePassword}
                          disabled={loading || !newPassword || !confirmPassword}
                        >
                          {loading ? "Saving..." : "Change Password"}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
          <div>{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
