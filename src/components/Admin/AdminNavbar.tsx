'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Settings, Store, Bell } from 'lucide-react';

interface AdminNavbarProps {
  pendingCount?: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ pendingCount = 0 }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'ออเดอร์ & ภาพรวม', href: '/admin', icon: LayoutDashboard, badge: pendingCount },
    { label: 'จัดการเมนู & ราคา', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'ตั้งค่าร้าน & สถานะ', href: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-orange-400">
              ระบบหลังร้าน (Admin Portal)
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">ร้านข้าวคุณแม่ Management System</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            href="/"
            className="ml-2 flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl transition-colors"
          >
            หน้าหน้าร้าน ↗
          </Link>
        </nav>
      </div>
    </header>
  );
};
