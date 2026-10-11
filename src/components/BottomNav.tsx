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
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-border pb-safe transition-all shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center relative touch-target transition-colors ${
                isActive
                  ? 'text-terracotta font-semibold'
                  : 'text-driftwood hover:text-charcoal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-terracotta text-[8px] font-bold text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-terracotta rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
