'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { MenuItemData } from './MenuCard';
import { useLiff } from './LiffProvider';

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
  const { isLoggedIn, login } = useLiff();
  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold text-gray-800 text-base sm:text-lg">ตะกร้าสินค้า</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} รายการ
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
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
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex gap-3 relative hover:border-orange-200 transition-all"
              >
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                        {item.menuItem.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.menuItem.id)}
                        className="text-gray-300 hover:text-red-500 p-1 -mt-0.5 -mr-0.5 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.specialRequest && item.specialRequest.startsWith('เลือก:') && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-1 border border-orange-200">
                        {item.specialRequest}
                      </span>
                    )}
                    <p className="text-xs font-bold text-orange-600 mt-0.5">
                      ฿{(item.menuItem.price * item.quantity).toFixed(0)}
                    </p>
                  </div>

                  {/* Special Request + Quantity */}
                  <div className="mt-2 space-y-2">
                    {/* Selectable Choice Dropdown inside Cart Drawer if item has options */}
                    {item.menuItem.options && item.menuItem.options.length > 0 && (
                      <div>
                        <select
                          value={
                            item.specialRequest?.startsWith('เลือก:')
                              ? item.specialRequest.replace('เลือก:', '').trim()
                              : item.menuItem.options[0].name
                          }
                          onChange={(e) => {
                            const newOptionName = e.target.value;
                            const matchedOption = item.menuItem.options?.find(o => o.name === newOptionName);
                            // We can update the special request
                            onUpdateSpecialRequest(item.menuItem.id, `เลือก: ${newOptionName}`);
                          }}
                          className="w-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          {item.menuItem.options.map((opt) => {
                            const optFinalPrice = opt.price - (item.menuItem.discount || 0);
                            return (
                              <option key={opt.name} value={opt.name}>
                                🥩 เนื้อสัตว์: {opt.name} {optFinalPrice > 0 ? `(฿${optFinalPrice})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ระบุเพิ่มเติม (เช่น เผ็ดน้อย)"
                        value={
                          item.specialRequest?.startsWith('เลือก:')
                            ? ''
                            : item.specialRequest || ''
                        }
                        onChange={(e) => onUpdateSpecialRequest(item.menuItem.id, e.target.value)}
                        className="flex-1 min-w-0 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                          className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 space-y-3 shrink-0 safe-bottom">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">ราคารวมทั้งหมด:</span>
              <span className="text-xl font-black text-orange-600">฿{totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  alert('กรุณาเข้าสู่ระบบ LINE ก่อนสั่งอาหาร');
                  login();
                  return;
                }
                onProceedToCheckout();
              }}
              disabled={!isStoreOpen}
              className={`w-full py-4 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all text-sm sm:text-base ${
                isStoreOpen
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-200 active:scale-98'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{isLoggedIn ? 'ดำเนินการชำระเงิน' : 'เข้าสู่ระบบ LINE เพื่อสั่งอาหาร'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
