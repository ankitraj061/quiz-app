// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 text-gray-800">
//       <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
//         <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz App</h1>
//         <p className="text-gray-600 mb-8">
//           Test your knowledge and compete with others!
//         </p>
//         <div className="flex gap-5 justify-center">
//           <Link
//             href="/auth/student/login"
//             className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md mt-4"
//           >
//             I am a Student
//           </Link>
//           <Link
//             href=""
//             className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md mt-4"
//           >
//             I am a School
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { Loader2, LogIn, Mail } from "lucide-react";
import {
  loginStudent,
  resendVerificationLink,
  forgotPassword,
} from "@/app/lib/studentApi";
import { ApiError } from "@/app/lib/apiError";
import Link from "next/link";


const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

const isPhone = (value: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(value.trim());
};

const parseIdentifier = (identifier: string, password: string) => {
  const trimmedIdentifier = identifier.trim();

  if (isEmail(trimmedIdentifier)) {
    return { email: trimmedIdentifier, password };
  } else if (isPhone(trimmedIdentifier)) {
    return { phone: trimmedIdentifier, password };
  }
  return null;
};


export default function Home() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const [isForgotDialogOpen, setIsForgotDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const {
    isAuthenticated,
    checkAuth,
    user,
    isLoading: authLoading,
  } = useAuth();


  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "STUDENT") {
      router.replace("/student/dashboard");
    }
  }, [authLoading, isAuthenticated, user, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const data = parseIdentifier(identifier, password);
    if (!data) {
      toast.error("Please enter a valid email or 10-digit phone number");
      return;
    }

    try {
      setIsLoading(true);
      const success = await loginStudent(data);

      if (success) {
        toast.success("Login successful!");
        await checkAuth();
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim() || !isEmail(forgotEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setIsForgotLoading(true);
      await forgotPassword(forgotEmail);

      toast.success("Password reset link sent!");
      setIsForgotDialogOpen(false);
      setForgotEmail("");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send reset email");
      }
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail.trim() || !isEmail(resendEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setIsResending(true);
      await resendVerificationLink(resendEmail);

      toast.success("Verification link sent!");
      setIsDialogOpen(false);
      setResendEmail("");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to resend verification link");
      }
    } finally {
      setIsResending(false);
    }
  };

  const identifierError =
    identifier && !isEmail(identifier) && !isPhone(identifier)
      ? "Please enter a valid email or 10-digit phone number"
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/auth/school/login"
          className="px-6 py-3 rounded-xl text-sm font-semibold
           bg-indigo-600 text-white shadow-md
           hover:bg-indigo-700 hover:shadow-lg
           transition-all duration-300"
        >
          I am a School
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <LogIn className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Login with your email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className={identifierError ? "border-red-500" : ""}
              />
              {identifierError && (
                <p className="text-sm text-red-500">{identifierError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Team Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your team password"
                disabled={isLoading}
              />

              <div className="flex justify-end">
                <Dialog
                  open={isForgotDialogOpen}
                  onOpenChange={setIsForgotDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors cursor-pointer"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email to receive a reset link.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleForgotPassword}>
                      <div className="py-4">
                        <Label className="mb-3">Email Address</Label>
                        <Input
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Enter your email"
                          disabled={isForgotLoading}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsForgotDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isForgotLoading}>
                          {isForgotLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white"
              disabled={isLoading || !!identifierError}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/auth/student/register")}
            >
              Don&apos;t have a team? Register
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Link
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resend Verification Email</DialogTitle>
                  <DialogDescription>
                    Enter your email to get a new verification link.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleResendVerification}>
                  <Input
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isResending}
                  />

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isResending}>
                      {isResending ? "Sending..." : "Send Link"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
