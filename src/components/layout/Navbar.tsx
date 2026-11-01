'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Calendar,
  Briefcase,
  Mic,
  Send,
  User,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Skill Map', href: '/map', icon: Compass },
    { label: 'Weekly Plan', href: '/plan', icon: Calendar },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Mock Practice', href: '/practice', icon: Mic },
    { label: 'Applications', href: '/applications', icon: Send },
  ];

  return (
    <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 mb-4">
      <div className="floating-nav rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 pr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div className="hidden sm:block leading-none">
            <span className="text-[#13221B] font-extrabold tracking-tight text-sm block">
              Career OS
            </span>
            <span className="text-[10px] text-[#4F7E67] font-semibold tracking-wide">
              Intelligence
            </span>
          </div>
        </Link>

        {/* Floating Horizontal Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E5F5EB] text-[#1B6342] shadow-xs font-bold'
                    : 'text-[#4A6456] hover:text-[#183526] hover:bg-[#F0F7F2]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B6342]' : 'text-[#6A8B79]'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tutor Experience Link (Part B Handoff) */}
        <div className="shrink-0 pl-1">
          <Link
            href="/tutor"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold shadow-xs transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Tutor</span>
            <span className="text-[10px] text-emerald-200">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
