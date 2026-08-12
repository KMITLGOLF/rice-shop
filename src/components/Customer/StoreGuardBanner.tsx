'use client';

import React from 'react';
import { AlertTriangle, Clock, CalendarX } from 'lucide-react';

interface StoreGuardBannerProps {
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  closedMessage: string;
}

export const StoreGuardBanner: React.FC<StoreGuardBannerProps> = ({ status, closedMessage }) => {
  if (status === 'OPEN') return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-md rounded-2xl mx-4 my-4 p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left border border-red-300">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        {status === 'CLOSED' ? (
          <Clock className="w-7 h-7 text-white animate-bounce" />
        ) : (
          <CalendarX className="w-7 h-7 text-white" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-200" />
          <h2 className="font-bold text-lg">
            {status === 'CLOSED' ? 'ขณะนี้ร้านปิดให้บริการ' : 'วันนี้เป็นวันหยุดประจำร้าน'}
          </h2>
        </div>
        <p className="text-sm text-orange-100 mt-1 font-medium leading-relaxed">
          {closedMessage || 'ขออภัยในความไม่สะดวก จะกลับมาเปิดให้บริการอีกครั้งเร็วๆ นี้ครับ'}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-100 border border-white/20">
        งดรับออเดอร์ชั่วคราว
      </div>
    </div>
  );
};
