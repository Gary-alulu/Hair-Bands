'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isMockAuth: boolean;
  mockLogin: (role: 'customer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockAuth, setIsMockAuth] = useState(false);

  // Check if real Supabase keys are configured
  const hasRealKeys = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  useEffect(() => {
    if (!hasRealKeys) {
      // Initialize mock session
      const storedMock = localStorage.getItem('luxury_mock_user');
      if (storedMock) {
        const mockData = JSON.parse(storedMock);
        setUser(mockData.user);
        setProfile(mockData.profile);
      }
      setIsMockAuth(true);
      setLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching Supabase session, entering mock mode:', err);
        setIsMockAuth(true);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [hasRealKeys]);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if record not synced yet
        setProfile({
          id: userId,
          full_name: 'Customer Name',
          phone: '',
          email: email,
          role: 'customer',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const signIn = async (email: string, password?: string) => {
    if (isMockAuth) {
      // Mock login implementation
      const is_admin = email.includes('admin');
      const mockProfile: Profile = {
        id: is_admin ? 'mock-admin-uuid' : 'mock-customer-uuid',
        full_name: is_admin ? 'Amina Keita (Admin)' : 'Zuri Wambui',
        phone: '+254712345678',
        email: email,
        role: is_admin ? 'admin' : 'customer',
      };
      const mockUser = {
        id: mockProfile.id,
        email: email,
      } as User;

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('luxury_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { success: true };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || '');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string, phone?: string) => {
    if (isMockAuth) {
      const mockProfile: Profile = {
        id: 'mock-customer-uuid-' + Math.floor(Math.random() * 1000),
        full_name: fullName || 'New Customer',
        phone: phone || '',
        email: email,
        role: 'customer',
      };
      const mockUser = {
        id: mockProfile.id,
        email: email,
      } as User;

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('luxury_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { success: true };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isMockAuth) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('luxury_mock_user');
      return;
    }

    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = (role: 'customer' | 'admin') => {
    const is_admin = role === 'admin';
    const mockProfile: Profile = {
      id: is_admin ? 'mock-admin-uuid' : 'mock-customer-uuid',
      full_name: is_admin ? 'Amina Keita (Admin)' : 'Zuri Wambui',
      phone: '+254 712 345678',
      email: is_admin ? 'admin@luxuryhair.com' : 'zuri.wambui@gmail.com',
      role: role,
    };
    const mockUser = {
      id: mockProfile.id,
      email: mockProfile.email,
      user_metadata: {
        full_name: mockProfile.full_name,
      }
    } as any as User;

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('luxury_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, isAdmin, isMockAuth, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
