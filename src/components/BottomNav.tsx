'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HeartHandshake, CreditCard, Users, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function BottomNav() {
  const pathname = usePathname();
  const { lang, t } = useTranslation();

  const items = [
    { href: '/', label: t.home, icon: Home },
    { href: '/appeals', label: lang === 'hi' ? 'सहयोग' : 'Appeals', icon: HeartHandshake, badge: t.live },
    { href: '/member-card', label: lang === 'hi' ? 'पहचान पत्र' : 'ID Card', icon: CreditCard },
    { href: '/member', label: lang === 'hi' ? 'सदस्य' : 'Members', icon: Users },
    { href: '/niyamawali', label: lang === 'hi' ? 'नियमावली' : 'Rules', icon: BookOpen },
  ];

  if (
    pathname.startsWith('/console-secure-admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-border/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-all shadow-[0_-4px_24px_rgba(0,0,0,0.07)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center relative touch-target py-1 transition-all rounded-xl select-none ${
                isActive
                  ? 'text-terracotta font-bold'
                  : 'text-driftwood hover:text-charcoal active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-3.5 px-1.5 py-0.2 bg-terracotta text-[8px] font-bold text-white rounded-full leading-tight shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 leading-none tracking-tight truncate max-w-[58px] text-center ${isActive ? 'font-bold text-terracotta' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-1 bg-terracotta rounded-full shadow-[0_1px_4px_rgba(200,90,50,0.4)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
