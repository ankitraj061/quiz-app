'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

  // Wrap checkAuth with useCallback to prevent infinite loops
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Checking auth");
      
      const response = await fetch(`${config.backendUrl}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log("Auth response:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Auth data:", data);
        setStudent(data.data.userData);
        setTeam(data.data.team);
      } else {
        // Not authenticated
        console.log("Not authenticated");
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
  }, []); // Empty dependency array since it doesn't depend on any state

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Now safe to include checkAuth in dependencies

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
