'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '@/components/Admin/AdminNavbar';
import { MenuFormModal } from '@/components/Admin/MenuFormModal';
import { MenuItemData } from '@/components/Customer/MenuCard';
import { UtensilsCrossed, Plus, Edit2, Trash2, Star, Check, X, Search } from 'lucide-react';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);

  const fetchMenu = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/categories'),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      setItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('Failed to load menu list:', err);
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSaveMenuItem = async (itemData: any) => {
    const isEdit = Boolean(itemData.id);
    const url = isEdit ? `/api/menu/${itemData.id}` : '/api/menu';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (!res.ok) {
      throw new Error('Failed to save menu item');
    }

    await fetchMenu();
  };

  const handleToggleStock = async (id: string, currentStock: boolean) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStock }),
      });

      if (res.ok) {
        fetchMenu();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบเมนู "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data?.note) {
          // Default item (not in DB) — just remove from local state
          setItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          // Real DB item — refetch to sync
          await fetchMenu();
        }
      } else {
        alert('เกิดข้อผิดพลาดในการลบรายการ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบรายการ');
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto w-full flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              จัดการรายการอาหาร & ราคา (Menu CRUD)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              เพิ่ม เมนูใหม่ แก้ไขราคา และเปิด-ปิดสถานะสินค้าหมด
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> เพิ่มเมนูใหม่
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเมนู..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-800"
          />
        </div>

        {/* Menu Table / Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            กำลังโหลดข้อมูลเมนู...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">เมนูอาหาร</th>
                    <th className="p-3.5">หมวดหมู่</th>
                    <th className="p-3.5 text-right">ราคา</th>
                    <th className="p-3.5 text-center">สถานะสินค้า</th>
                    <th className="p-3.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              {item.name}
                              {item.isRecommended && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200">
                          {item.category?.name || 'ทั่วไป'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-orange-600 text-sm">
                        ฿{item.price.toFixed(0)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleStock(item.id, item.isAvailable)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                          }`}
                        >
                          {item.isAvailable ? '✓ มีจำหน่าย (In Stock)' : '✕ หมด (Out of Stock)'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="แก้ไขเมนู"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบเมนู"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <MenuFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialItem={selectedItem}
          categories={categories}
          onSave={handleSaveMenuItem}
        />
      </main>
    </div>
  );
}
