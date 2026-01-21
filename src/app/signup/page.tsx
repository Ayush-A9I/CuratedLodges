"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin page
    router.replace('/signin');
  }, [router]);

  return null;
}
