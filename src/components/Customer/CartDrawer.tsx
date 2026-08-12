'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { MenuItemData } from './MenuCard';

export interface CartItem {
  menuItem: MenuItemData;
  quantity: number;
  specialRequest?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onUpdateSpecialRequest: (menuItemId: string, note: string) => void;
  onRemoveItem: (menuItemId: string) => void;
  onProceedToCheckout: () => void;
  isStoreOpen: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onUpdateSpecialRequest,
  onRemoveItem,
  onProceedToCheckout,
  isStoreOpen,
}) => {
  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-gray-800 text-lg">ตะกร้าสินค้าของคุณ</h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} รายการ
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <ShoppingBag className="w-16 h-16 text-gray-200 mb-3" />
                <p className="font-semibold text-gray-600">ยังไม่มีรายการอาหารในตะกร้า</p>
                <p className="text-xs text-gray-400 mt-1">เลือกรายการอาหารที่คุณชอบ แล้วกดปุ่มสั่งอาหารได้เลย</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm flex gap-3 relative hover:border-orange-200 transition-all"
                >
                  <img
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                          {item.menuItem.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.menuItem.id)}
                          className="text-gray-300 hover:text-red-500 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-orange-600 mt-0.5">
                        ฿{(item.menuItem.price * item.quantity).toFixed(0)}
                      </p>
                    </div>

                    {/* Special Instructions Note */}
                    <input
                      type="text"
                      placeholder="ระบุเพิ่มเติม (เช่น เผ็ดน้อย, ไม่ใส่ผัก)"
                      value={item.specialRequest || ''}
                      onChange={(e) => onUpdateSpecialRequest(item.menuItem.id, e.target.value)}
                      className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
                    />

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2 self-end">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                        className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">ราคารวมทั้งหมด:</span>
                <span className="text-xl font-black text-orange-600">฿{totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={onProceedToCheckout}
                disabled={!isStoreOpen}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isStoreOpen
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-200 active:scale-98'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <span>ดำเนินการชำระเงิน (PromptPay)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
