'use client';

// useAuth — shortcut لـ AuthContext
// يعرض user + profile + isAdmin في مكان واحد
import { useAuth as useAuthContext } from '@/lib/context/AuthContext';

export function useAuth() {
  const { user, profile, isAdmin, isAuthenticated, isLoadingAuth, logout, refreshProfile, isDisabled } =
    useAuthContext();
  return {
    user,
    profile,       // بيانات الـ profile (onboarded, university, major ...)
    isAdmin,       // true لو role === 'admin'
    isDisabled,
    loading: isLoadingAuth,
    isAuthenticated,
    logout,
    refreshProfile, // استدعيها بعد updateProfile لتحديث الـ context
  };
}