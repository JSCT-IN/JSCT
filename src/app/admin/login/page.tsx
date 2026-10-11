'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified login with Admin module preselected
    router.replace('/login?tab=admin');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-terracotta border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-driftwood">व्यवस्थापक पोर्टल पर भेजा जा रहा है...</p>
      </div>
    </div>
  );
}
