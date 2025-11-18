'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { config } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

interface Team {
  id: string;
  teamName: string;
}

interface AuthContextType {
  user: User | null;
  team: Team | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${config.backendUrl}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          ...data.data.userData,
          role: data.data.role  
        };
        
        setUser(userData);
        setTeam(data.data.team || null);
      } else {
        setUser(null);
        setTeam(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await fetch(`${config.backendUrl}/api/v1/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setTeam(null);
    }
  };

  // Create stable context value
  const contextValue = {
    user,
    team,
    isAuthenticated: !!user,
    isLoading,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
