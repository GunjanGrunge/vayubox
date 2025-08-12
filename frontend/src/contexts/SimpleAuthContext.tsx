'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('dropaws_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check credentials against public environment variables
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      console.log('Auth debug:', {
        hasAdminEmail: !!adminEmail,
        hasAdminPassword: !!adminPassword,
        inputEmail: email,
      });
      
      if (email === adminEmail && password === adminPassword) {
        const userData = { email, isAuthenticated: true };
        setUser(userData);
        localStorage.setItem('dropaws_user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dropaws_user');
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    // For this simple auth system, we'll just create a user account
    // Check against public environment variables
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (email === adminEmail && password === adminPassword) {
      const userData = { email, isAuthenticated: true };
      setUser(userData);
      localStorage.setItem('dropaws_user', JSON.stringify(userData));
    } else {
      throw new Error('Registration not available for this demo app');
    }
  };

  const value = {
    user,
    loading,
    login,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
