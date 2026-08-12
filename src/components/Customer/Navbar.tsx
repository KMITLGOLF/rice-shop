'use client';

import React from 'react';
import { ShoppingBag, Store, UserCheck, ShieldCheck } from 'lucide-react';
import { useLiff } from './LiffProvider';
import Link from 'next/link';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  storeStatus: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  storeName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, storeStatus, storeName }) => {
  const { isLoggedIn, profile, login, isMockUser } = useLiff();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Store Status */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-orange-600 transition-colors">
              {storeName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  storeStatus === 'OPEN'
                    ? 'bg-emerald-500 animate-pulse'
                    : storeStatus === 'CLOSED'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-xs text-gray-500 font-medium">
                {storeStatus === 'OPEN' ? 'เปิดให้บริการ' : storeStatus === 'CLOSED' ? 'ร้านปิด' : 'วันหยุดร้าน'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Admin link shortcut */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-orange-600 bg-gray-100 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ระบบร้านค้า (Admin)
          </Link>

          {/* User LINE Avatar / Login Button */}
          {isLoggedIn && profile ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-200">
              <img
                src={profile.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={profile.displayName}
                className="w-6 h-6 rounded-full object-cover border border-emerald-300"
              />
              <span className="max-w-[80px] truncate">{profile.displayName}</span>
              {isMockUser && <span className="text-[10px] text-emerald-600 font-normal">(Demo)</span>}
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              LINE Login
            </button>
          )}

          {/* Floating Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
