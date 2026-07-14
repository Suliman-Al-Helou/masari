'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('invite');

useEffect(() => {
  if(token){
    router.replace(`/login?invite=${token}`);
  }else{
    router.replace('/login') // with out token 
  }
}, [token, router]);
  return null;
}