'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginStudent } from '../lib/studentApi';
import { config } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Team {
  id: string;
  teamName: string;
}

interface AuthContextType {
  student: Student | null;
  team: Team | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log("Checking auth");
      
      const response = await fetch(`${config.backendUrl}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      console.log(response);
      
      if (response.ok) {
        const data = await response.json();
        setStudent(data.data.userData);
        setTeam(data.data.team);
      } else {
        // Not authenticated
        setStudent(null);
        setTeam(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setStudent(null);
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await fetch(`${config.backendUrl}/api/v1/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setStudent(null);
      setTeam(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        team,
        isAuthenticated: !!student,
        isLoading,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================
// UPDATED: Dashboard Component
// ============================================

/*
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { QuizCard } from '@/app/components/QuizCard';
import { QUIZZES } from '@/app/lib/quizData';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, team, student, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/student/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{student?.name}</span> from team{' '}
          <span className="font-semibold text-foreground">{team?.teamName}</span>!
          Choose a quiz to get started.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUIZZES.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
*/

// ============================================
// UPDATED: Login Component
// ============================================

/*
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(identifier, password);

      if (success) {
        toast.success('Login successful!');
        router.push('/student/dashboard');
      } else {
        toast.error('Invalid credentials. Please check your email/phone and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
};

export default Login;
*/