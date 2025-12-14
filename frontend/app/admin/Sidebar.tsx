"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  LogOut,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
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

const Sidebar = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<"verify" | "change">("verify");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navItems = [
    {
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/admin/create",
      icon: PlusCircle,
      label: "Create Quiz",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/auth/admin/login");
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
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
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

      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {/* Add Admin Button */}
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <Link href="/admin/add-admin">
            <UserPlus className="w-5 h-5" />
            <span>Add Admin</span>
          </Link>
        </Button>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will end your current session and you&apos;ll need to login
                again to access the admin portal.
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

        {/* Reset Password Button - Below Logout */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <KeyRound className="w-5 h-5" />
              <span>Reset Password</span>
            </Button>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
      </div>
    </aside>
  );
};

export default Sidebar;
