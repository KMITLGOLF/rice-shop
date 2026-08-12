'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminNavbar } from '@/components/Admin/AdminNavbar';
import { OrderCard, OrderData } from '@/components/Admin/OrderCard';
import { playNewOrderChime } from '@/components/Admin/SoundNotification';
import { LayoutDashboard, DollarSign, ShoppingBag, Clock, CheckCircle2, Volume2, VolumeX, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const prevOrderCountRef = useRef<number>(0);

  const fetchOrders = async (isInitial = false) => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();

        // Check if new order arrived to trigger audio chime
        if (!isInitial && data.length > prevOrderCountRef.current && soundEnabled) {
          playNewOrderChime();
        }

        prevOrderCountRef.current = data.length;
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    // Real-time polling every 4 seconds for live order notifications
    const interval = setInterval(() => fetchOrders(false), 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders(false);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        fetchOrders(false);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
    }
  };

  // Metrics Calculations (Today's metrics)
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const activeOrders = orders.filter((o) => ['PENDING', 'PREPARING', 'READY'].includes(o.status));
  const completedOrders = todayOrders.filter((o) => o.status === 'COMPLETED');

  // Filtered list
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    if (filterStatus === 'ACTIVE') return ['PENDING', 'PREPARING', 'READY'].includes(o.status);
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <AdminNavbar pendingCount={pendingOrders.length} />

      <main className="max-w-6xl mx-auto w-full flex-1 p-4 md:p-6 space-y-6">
        {/* Sales Dashboard Metrics Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-orange-600" />
              แดชบอร์ดสรุปยอดขาย & คิวอาหารเรียลไทม์
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              ระบบรับออเดอร์ แจ้งเตือนเสียง และอัปเดตสถานะอาหาร
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                soundEnabled
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'เปิดเสียงแจ้งเตือน' : 'ปิดเสียงแจ้งเตือน'}
            </button>

            <button
              onClick={() => fetchOrders(false)}
              className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm border border-slate-200 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">ยอดขายรวมวันนี้</p>
              <h3 className="text-xl font-black text-slate-800">฿{totalRevenue.toFixed(0)}</h3>
            </div>
          </div>

          {/* Today Orders */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">ออเดอร์วันนี้</p>
              <h3 className="text-xl font-black text-slate-800">{todayOrders.length} ออเดอร์</h3>
            </div>
          </div>

          {/* Pending Queue */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">คิวรอทำอาหาร</p>
              <h3 className="text-xl font-black text-amber-600">{activeOrders.length} คิว</h3>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">เสร็จสิ้นแล้ว</p>
              <h3 className="text-xl font-black text-emerald-600">{completedOrders.length} ออเดอร์</h3>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ACTIVE', label: '🔥 คิวรอทำอาหาร (Active)' },
            { id: 'PENDING', label: '⏳ รอรับออเดอร์' },
            { id: 'PREPARING', label: '🍳 กำลังปรุง' },
            { id: 'READY', label: '🔔 พร้อมรับอาหาร' },
            { id: 'COMPLETED', label: '✓ เสร็จสิ้นแล้ว' },
            { id: 'ALL', label: '📋 ประวัติทั้งหมด' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-slate-300'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Stream Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            กำลังโหลดข้อมูลคิวออเดอร์...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">ไม่มีรายการออเดอร์ในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onUpdatePayment={handleUpdatePayment}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
