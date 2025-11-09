'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-6xl font-bold text-blue-600 mb-4">WMS</div>
        <p className="text-xl text-gray-600">Warehouse Management System</p>
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}
