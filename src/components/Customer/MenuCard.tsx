'use client';

import React from 'react';
import { Plus, Flame, Star, XCircle } from 'lucide-react';

export interface MenuItemData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isRecommended: boolean;
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
      {/* Food Image Container */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
            !item.isAvailable ? 'grayscale-[50%]' : ''
          }`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isRecommended && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Star className="w-3 h-3 fill-current" /> เมนูแนะนำ
            </span>
          )}
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2">
            <XCircle className="w-8 h-8 text-rose-400 mb-1" />
            <span className="font-bold text-sm bg-rose-600 px-3 py-1 rounded-full shadow">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price & Add Button */}
        <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-gray-400">฿</span>
            <span className="text-lg font-black text-orange-600">{item.price.toFixed(0)}</span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            disabled={!canOrder}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              canOrder
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-orange-200 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {canOrder ? 'สั่งอาหาร' : 'หมด'}
          </button>
        </div>
      </div>
    </div>
  );
};
