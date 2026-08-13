'use client';

import React from 'react';
import { ShoppingBag, Store, UserCheck, ShieldCheck, UserRound, ListOrdered } from 'lucide-react';
import { useLiff } from './LiffProvider';
import Link from 'next/link';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  storeStatus: 'OPEN' | 'CLOSED' | 'HOLIDAY' | 'QUEUE_ONLY';
  storeName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, storeStatus, storeName }) => {
  const { isLoggedIn, profile, login } = useLiff();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Store Status */}
        <Link href="/" className="flex items-center gap-2 group min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-800 text-sm sm:text-base leading-tight truncate max-w-[140px] sm:max-w-none group-hover:text-orange-600 transition-colors">
              {storeName}
            </h1>
            <div className="flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  storeStatus === 'OPEN'
                    ? 'bg-emerald-500 animate-pulse'
                    : storeStatus === 'QUEUE_ONLY'
                    ? 'bg-violet-500 animate-pulse'
                    : storeStatus === 'CLOSED'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
                {storeStatus === 'OPEN' ? 'เปิดให้บริการ' : storeStatus === 'QUEUE_ONLY' ? 'รับจองคิว' : storeStatus === 'CLOSED' ? 'ร้านปิด' : 'วันหยุดร้าน'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Admin link - desktop only */}
          <Link
            href="/admin"
            className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-orange-600 bg-gray-100 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ระบบร้านค้า
          </Link>

          {/* User LINE Avatar / Login Button */}
          {isLoggedIn && profile ? (
            <>
            <Link href="/my-orders" aria-label="คิวของฉัน" className="p-2 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100">
              <ListOrdered className="w-4 h-4" />
            </Link>
            <Link href="/profile" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200 hover:bg-emerald-100">
              <img
                src={profile.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={profile.displayName}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-emerald-300 shrink-0"
              />
              <span className="max-w-[60px] sm:max-w-[80px] truncate text-[10px] sm:text-xs">{profile.displayName}</span>
              <UserRound className="w-3 h-3" />
            </Link>
            </>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">LINE </span>Login
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative bg-orange-600 hover:bg-orange-700 active:scale-95 text-white p-2 sm:p-2.5 rounded-full shadow-md transition-all"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
