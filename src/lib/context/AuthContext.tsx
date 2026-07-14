"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/db/client";
import type { User } from "@supabase/supabase-js";

// =====================
// Types
// =====================
interface Profile {
  id: string;
  full_name: string;
  university: string | null;
  major: string | null;
  semester: string | null;
  total_credits: number | null;
  onboarded: boolean;
  show_in_network: boolean;
  degree_type: string | null;
  role: "student" | "admin";
  deleted_at: string | null;
}

interface AuthContextType {
  profileError: string | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isDisabled: boolean;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // جلب الـ profile — لا يستدعي supabase.auth داخله لتجنب تعارض الـ lock
  const fetchProfile = async (userId: string) => {
    setProfileError(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
      setProfileError(error.message);
      return;
    }

    setProfile(data as Profile);
  };

  // تحديث الـ profile بعد updateProfile (مثلاً بعد إكمال الـ onboarding)
  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setProfileError(null);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setIsLoadingAuth(false);
        return;
      }

      setIsLoadingAuth(true);

      timeoutId = setTimeout(() => {
        void fetchProfile(currentUser.id).finally(() => {
          setIsLoadingAuth(false);
        });
      }, 0);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      subscription.unsubscribe();
    };
  }, []);
  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange سيُنظّف الـ user والـ profile تلقائياً
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileError,
        isAdmin: profile?.role === "admin",
        isDisabled: Boolean(profile?.deleted_at),
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        logout,
        refreshProfile,
      }}
    >
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
    throw new Error("useAuth لازم يُستخدم داخل AuthProvider");
  }
  return context;
}
