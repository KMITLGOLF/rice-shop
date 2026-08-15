'use client';

import React from 'react';
import { Plus, Star, XCircle } from 'lucide-react';

export interface MenuItemData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isRecommended: boolean;
  options?: Array<{ name: string; price: number }>;
  category?: { name: string };
}

interface MenuCardProps {
  item: MenuItemData;
  onAddToCart: (item: MenuItemData) => void;
  isStoreOpen: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart, isStoreOpen }) => {
  const canOrder = isStoreOpen && item.isAvailable;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
        !item.isAvailable ? 'opacity-75 bg-gray-50' : ''
      }`}
    >
      {/* Food Image */}
      <div className="relative h-36 sm:h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
            !item.isAvailable ? 'grayscale-[50%]' : ''
          }`}
        />

        {/* Badges */}
        {item.isRecommended && (
          <div className="absolute top-2 left-2">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
              <Star className="w-2.5 h-2.5 fill-current" /> แนะนำ
            </span>
          </div>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
            <XCircle className="w-7 h-7 text-rose-400 mb-1" />
            <span className="font-bold text-xs bg-rose-600 px-3 py-1 rounded-full shadow">
              หมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-snug line-clamp-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Available Options Badge */}
          {((item.options && item.options.length > 0) || item.name.includes('สปาเก็ตตี้') || item.name.includes('ผัด') || item.name.includes('คาโบ')) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="bg-orange-50 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-orange-200">
                🥩 มีตัวเลือกเนื้อสัตว์ (Choice)
              </span>
            </div>
          )}
        </div>

        {/* Price & Add Button */}
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-medium text-gray-400">฿</span>
            <span className="text-base sm:text-lg font-black text-orange-600">{item.price.toFixed(0)}</span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            disabled={!canOrder}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-sm min-w-[72px] justify-center ${
              canOrder
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {canOrder ? 'สั่ง' : 'หมด'}
          </button>
        </div>
      </div>
    </div>
  );
};
