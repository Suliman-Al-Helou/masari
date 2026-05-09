'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('invite');

  useEffect(() => {
    // وجّه للـ login مع الـ token
    router.replace(`/login?invite=${token}`);
  }, [token]);

  return null;
}