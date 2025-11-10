'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { Loader2, LogIn } from 'lucide-react';
import { loginStudent } from '@/app/lib/studentApi';
import { ApiError } from '@/app/lib/apiError';

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
  } else {
    return null;
  }
};



const Login = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const data = parseIdentifier(identifier, password);
    if (!data) {
      toast.error('Please enter a valid email or 10-digit phone number');
      return;
    }
    try {
      const success = await loginStudent(data);
      if (success) {
        toast.success('Login successful!');
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 1000);
      } else {
        toast.error('Invalid credentials. Please check your email/phone and password.');
      }

    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        if (error.errors && error.errors.length > 0) {
          error.errors.forEach((err) => {
            toast.error(err);
          });
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        console.error('Registration error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getIdentifierError = () => {
    if (!identifier) return null;
    if (isEmail(identifier) || isPhone(identifier)) return null;
    return 'Please enter a valid email or 10-digit phone number';
  };

  const identifierError = getIdentifierError();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <LogIn className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Login with your email or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or phone"
                required
                disabled={isLoading}
                className={identifierError ? 'border-red-500' : ''}
              />
              {identifierError && (
                <p className="text-sm text-red-500">{identifierError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Team Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your team password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading || !!identifierError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/student/register')}
                disabled={isLoading}
              >
                Don't have a team? Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
