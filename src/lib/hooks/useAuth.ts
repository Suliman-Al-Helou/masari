'use client';

// useAuth هو shortcut لـ AuthContext — single source of truth
// loading يُعيد isLoadingAuth ليتوافق مع كل المكونات الموجودة
import { useAuth as useAuthContext } from '@/lib/context/AuthContext';

export function useAuth() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuthContext();
  return {
    user,
    loading: isLoadingAuth,   // alias للتوافق مع المكونات القديمة
    isAuthenticated,
    logout,
  };
}