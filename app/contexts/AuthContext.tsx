'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTeamData, getCurrentSession, setCurrentSession, clearCurrentSession } from '@/app/lib/storage';

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

interface Team {
  teamName: string;
  password: string;
  members: TeamMember[];
}

interface AuthContextType {
  team: Team | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    // Safe to access localStorage inside useEffect (client-side only)
    const session = getCurrentSession();
    if (session) {
      const teamData = getTeamData();
      if (teamData) {
        setTeam(teamData);
      }
    }
  }, []);

  const login = (identifier: string, password: string): boolean => {
    const teamData = getTeamData();
    if (!teamData) return false;

    const isMemberExists = teamData.members.some(
      (member) => member.email === identifier || member.phone === identifier
    );

    if (isMemberExists && teamData.password === password) {
      setTeam(teamData);
      setCurrentSession(teamData.teamName);
      return true;
    }

    return false;
  };

  const logout = () => {
    setTeam(null);
    clearCurrentSession();
  };

  return (
    <AuthContext.Provider value={{ team, isAuthenticated: !!team, login, logout }}>
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
