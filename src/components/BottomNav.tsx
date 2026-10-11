'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HeartHandshake, User, SearchCheck, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const items = [
    { href: '/', label: t.home, icon: Home },
    { href: '/appeals', label: t.appeals, icon: HeartHandshake, badge: t.live },
    { href: '/dashboard', label: t.profile, icon: User },
    { href: '/rules', label: t.rules, icon: BookOpen },
    { href: '/admin/inspector', label: t.audit, icon: SearchCheck },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-border/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center relative touch-target py-1 transition-all rounded-xl ${
                isActive
                  ? 'text-terracotta font-bold'
                  : 'text-driftwood hover:text-charcoal active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-3.5 px-1.5 py-0.2 bg-terracotta text-[8px] font-bold text-white rounded-full leading-tight shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 leading-none tracking-tight ${isActive ? 'font-bold text-terracotta' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-1 bg-terracotta rounded-full shadow-[0_1px_4px_rgba(200,90,50,0.4)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
