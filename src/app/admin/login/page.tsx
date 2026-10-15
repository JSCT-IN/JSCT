'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect cleanly to isolated Admin Login Gate
    router.replace('/console-secure-admin/login');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">सुरक्षित व्यवस्थापक पोर्टल पर भेजा जा रहा है...</p>
      </div>
    </div>
  );
}
