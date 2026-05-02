'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// =====================
// Types
// =====================
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  logout: () => Promise<void>;
}

// =====================
// Context
// =====================
const AuthContext = createContext<AuthContextType | null>(null);

// =====================
// Provider
// =====================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // جلب المستخدم الحالي عند فتح الموقع
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoadingAuth(false);
    });

    // متابعة تغييرات الـ Auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
        setIsLoadingAuth(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================
// Hook
// =====================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth لازم يُستخدم داخل AuthProvider');
  }
  return context;
}