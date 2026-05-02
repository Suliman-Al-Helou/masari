'use client';

import { useAuth } from '@/lib/context/AuthContext';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
  </div>
);

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback = <LoadingSpinner /> }: Props) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return fallback;

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}