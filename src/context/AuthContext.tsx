import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useUsers } from './UserContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, country: string, phoneCode: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUsers } = useUsers();
  const { users } = useUsers();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Check for stored test user
      const storedTestUser = localStorage.getItem('test_user');
      if (storedTestUser) {
        setUser(JSON.parse(storedTestUser));
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Check for stored test user
      const storedTestUser = localStorage.getItem('test_user');
      if (storedTestUser) {
        setUser(JSON.parse(storedTestUser));
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is the admin user
      const isAdmin = email.toLowerCase() === 'admin@example.com' && password === 'admin123';
      const isTestUser = email.toLowerCase() === 'test@example.com' && password === 'test123'; 

      if (isTestUser) {
        // Create a mock session for test user
        const testUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            role: 'customer',
            name: 'TestCustomer',
            phone: '1234567890',
            uniqueId: 'T1234'
          }
        };
        
        // Update the auth state
        setUser(testUser as User);
        
        // Store test user in localStorage
        localStorage.setItem('test_user', JSON.stringify(testUser));
        return { error: null };
      }
      
      // Sign in with credentials
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Get the session to verify role
      const { data: { session } } = await supabase.auth.getSession();
      
      if (isAdmin && (!session?.user?.user_metadata?.role || session.user.user_metadata.role !== 'admin')) {
        return { error: new Error('Invalid admin credentials') };
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, country: string, phoneCode: string, phone: string) => {
    try {
      // Check if this is the admin user
      const isReservedEmail = email.toLowerCase() === 'admin@example.com' || 
                             email.toLowerCase() === 'test@example.com';
      
      if (isReservedEmail) {
        return { error: new Error('Cannot register with admin email') };
      }

      // Generate unique ID (one letter followed by 4 numbers)
      const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      const numbers = String(Math.floor(1000 + Math.random() * 9000));
      const uniqueId = `${letter}${numbers}`;

      // Create new user object
      const newUser = {
        id: Date.now(),
        uniqueId,
        username: name,
        email,
        phoneCode,
        phone,
        status: 'Active' as const
      };

      // Update users context first
      setUsers(prev => [...prev, newUser]);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            role: 'customer',
            uniqueId,
            name,
            country,
            phone_code: phoneCode,
            phone,
            status: 'Active',
            createdAt: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local session first
      const prevUser = user;
      setUser(null); 
      
      // Clear test user from localStorage
      localStorage.removeItem('test_user');

      // Then attempt to sign out from Supabase
      await supabase.auth.signOut();

      // If this was the admin user, ensure metadata is cleared
      if (prevUser?.email === 'admin@example.com') {
        await supabase.auth.refreshSession();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, we want to clear the local state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}