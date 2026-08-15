'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Customer/Navbar';
import { StoreGuardBanner } from '@/components/Customer/StoreGuardBanner';
import { CategoryTabs } from '@/components/Customer/CategoryTabs';
import { MenuCard, MenuItemData } from '@/components/Customer/MenuCard';
import { CartDrawer, CartItem } from '@/components/Customer/CartDrawer';
import { CheckoutModal } from '@/components/Customer/CheckoutModal';
import { OptionModal } from '@/components/Customer/OptionModal';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function CustomerHomePage() {
  const [storeSetting, setStoreSetting] = useState<{
    status: 'OPEN' | 'CLOSED' | 'HOLIDAY' | 'QUEUE_ONLY';
    closedMessage: string;
    storeName: string;
    promptpayId: string;
    promptpayName: string;
  }>({
    status: 'OPEN',
    closedMessage: '',
    storeName: '',
    promptpayId: '',
    promptpayName: '',
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Option Modal State
  const [selectedOptionItem, setSelectedOptionItem] = useState<MenuItemData | null>(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  // Fetch Store Status, Categories, and Menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, catRes, menuRes] = await Promise.all([
          fetch('/api/store-status'),
          fetch('/api/categories'),
          fetch('/api/menu'),
        ]);

        const storeData = await storeRes.json();
        const catData = await catRes.json();
        const menuData = await menuRes.json();

        setStoreSetting(storeData && !storeData.error ? storeData : {
          status: 'OPEN',
          closedMessage: '',
          storeName: '',
          promptpayId: '',
          promptpayName: '',
        });
        setCategories(Array.isArray(catData) ? catData : []);
        setMenuItems(Array.isArray(menuData) ? menuData : []);
      } catch (error) {
        console.error('Failed to load initial store data:', error);
        setCategories([]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = (item: MenuItemData) => {
    if (!['OPEN', 'QUEUE_ONLY'].includes(storeSetting.status)) {
      alert(storeSetting.closedMessage || 'ร้านปิดให้บริการอยู่ในขณะนี้');
      return;
    }

    const defaultOptions = [
      { name: 'ไส้กรอก', price: 65 },
      { name: 'เบคอน', price: 70 },
      { name: 'หมึก', price: 80 },
      { name: 'กุ้ง', price: 80 },
      { name: 'หมึก+กุ้ง', price: 95 },
    ];

    const rawOptions = (item as any).options;
    const hasOptions =
      (Array.isArray(rawOptions) && rawOptions.length > 0) ||
      item.name.includes('สปาเก็ตตี้') ||
      item.name.includes('ผัดขี้เมา') ||
      item.name.includes('ผัดพริก') ||
      item.name.includes('ผัดกะเพรา') ||
      item.name.includes('คาโบนาร่า') ||
      item.name.includes('ผัด') ||
      item.name.includes('ก๋วยเตี๋ยว') ||
      (item.description && item.description.includes('เลือกเนื้อสัตว์')) ||
      (item.category?.name && item.category.name.includes('เส้น'));

    if (hasOptions) {
      const itemOptions =
        Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions : defaultOptions;
      setSelectedOptionItem({ ...item, options: itemOptions } as any);
      setIsOptionModalOpen(true);
      return;
    }

    addCartItemWithOption(item, undefined, undefined);
  };

  const addCartItemWithOption = (item: MenuItemData, option?: string, optionPrice?: number) => {
    const cartItemId = option ? `${item.id}-${option}` : item.id;
    const displayName = option ? `${item.name} (${option})` : item.name;
    const finalPrice = optionPrice !== undefined ? optionPrice : item.price;

    setCart((prevCart) => {
      const existing = prevCart.find((ci) => (ci as any).cartItemId === cartItemId || ci.menuItem.id === cartItemId);
      if (existing) {
        return prevCart.map((ci) =>
          ((ci as any).cartItemId === cartItemId || ci.menuItem.id === cartItemId)
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [
        ...prevCart,
        {
          menuItem: {
            ...item,
            id: cartItemId,
            name: displayName,
            price: finalPrice,
          },
          quantity: 1,
          specialRequest: option ? `เลือก: ${option}` : undefined,
        },
      ];
    });

    showToast(`เพิ่ม "${displayName}" ลงในตะกร้าแล้ว`);
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.menuItem.id === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdateSpecialRequest = (menuItemId: string, note: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, specialRequest: note } : item
      )
    );
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuItem.id !== menuItemId));
  };

  // Filter menu items
  const filteredMenuItems = (Array.isArray(menuItems) ? menuItems : []).filter((item) => {
    const matchesCategory =
      selectedCategoryId === 'ALL' || item.category?.name === categories.find((c) => c.id === selectedCategoryId)?.name || (item as any).categoryId === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen pb-24 flex flex-col bg-slate-50">
      {/* Header Navigation */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        storeStatus={storeSetting.status}
        storeName={storeSetting.storeName}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full flex-1 px-3 sm:px-4 pt-2">
        {/* Store Closed / Holiday Banner Guard */}
        <StoreGuardBanner
          status={storeSetting.status}
          closedMessage={storeSetting.closedMessage}
        />

        {/* Hero Search & Title */}
        <div className="my-3 sm:my-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg shadow-orange-100 flex flex-col gap-3">
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-100 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> สั่งง่าย ได้ไว ไม่ต้องรอคิว
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-2 leading-tight">
              เมนูอร่อยเสิร์ฟร้อนสดใหม่ทุกวัน
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 font-medium">
              เลือกเมนู ชำระผ่าน PromptPay รับคิว LINE ได้ทันที
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออาหาร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-white text-gray-800 rounded-xl pl-9 pr-4 py-3 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
            />
          </div>
        </div>

        {/* Category Horizontal Filter Tabs */}
        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        )}

        {/* Menu Grid */}
        <div className="mt-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-orange-600">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p className="text-xs font-bold text-gray-600">กำลังโหลดรายการอาหาร...</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 my-6 shadow-sm border border-gray-100">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-600">ไม่พบรายการอาหารที่ค้นหา</p>
              <p className="text-xs text-gray-400 mt-1">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredMenuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  isStoreOpen={['OPEN', 'QUEUE_ONLY'].includes(storeSetting.status)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-3 sm:px-4 pb-3 sm:pb-4 safe-bottom">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-lg mx-auto block bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-orange-300 flex items-center justify-between font-bold active:scale-[0.98] transition-all border border-orange-400"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-orange-600 text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow shrink-0">
                {cartCount}
              </span>
              <span className="text-sm font-bold">ดูรายการในตะกร้า</span>
            </div>
            <div className="text-sm sm:text-base font-black">
              ฿{cart.reduce((s, i) => s + i.menuItem.price * i.quantity, 0).toFixed(0)} →
            </div>
          </button>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-gray-700 animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateSpecialRequest={handleUpdateSpecialRequest}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        isStoreOpen={['OPEN', 'QUEUE_ONLY'].includes(storeSetting.status)}
      />

      {/* Option Selection Modal */}
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        item={selectedOptionItem}
        onConfirm={(item, selectedOption, optionPrice) => {
          addCartItemWithOption(item, selectedOption, optionPrice);
        }}
      />

      {/* PromptPay Dynamic QR Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        promptpayId={storeSetting.promptpayId}
        promptpayName={storeSetting.promptpayName}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
