'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ChefHat, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Phone } from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error('Failed to fetch order status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto-poll status every 5 seconds for live status updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-orange-600">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="font-bold text-xs text-gray-600">กำลังดึงข้อมูลคิวออเดอร์...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-lg">ไม่พบข้อมูลออเดอร์</h3>
          <p className="text-xs text-gray-500 mt-1 mb-5">หมายเลขออเดอร์นี้อาจไม่มีอยู่ในระบบ หรือถูกยกเลิกไปแล้ว</p>
          <Link
            href="/"
            className="block py-3 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'รับออเดอร์แล้ว', icon: Clock, desc: 'รอร้านค้าตรวจสอบ' },
    { key: 'PREPARING', label: 'กำลังทำอาหาร', icon: ChefHat, desc: 'เชฟกำลังปรุงสดๆ' },
    { key: 'READY', label: 'อาหารเสร็จแล้ว', icon: AlertCircle, desc: 'พร้อมรับอาหารที่หน้าร้าน' },
    { key: 'COMPLETED', label: 'รับอาหารเรียบร้อย', icon: CheckCircle2, desc: 'ขอให้อร่อยครับ!' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PREPARING':
        return 1;
      case 'READY':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex flex-col items-center">
      <div className="max-w-md w-full space-y-4">
        {/* Top Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-orange-600 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าสั่งอาหาร
        </Link>

        {/* Queue Ticket Card */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white text-center shadow-xl border border-orange-300 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <button
              onClick={fetchOrder}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="รีเฟรชสถานะ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-bold text-amber-100 uppercase tracking-widest">หมายเลขคิวของคุณ</p>
          <div className="text-5xl font-black font-mono my-2 tracking-wider drop-shadow-md">
            {order.queueNumber}
          </div>
          <p className="text-sm font-semibold text-white">คุณ {order.customerName}</p>
          <p className="text-[11px] text-orange-100 mt-0.5">
            สั่งเมื่อ: {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </p>
        </div>

        {/* Live Progress Tracker */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm flex items-center justify-between">
            <span>สถานะคำสั่งซื้อ</span>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ● อัปเดตเรียลไทม์
            </span>
          </h3>

          <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                      isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 animate-pulse'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <h4
                      className={`font-bold text-sm ${
                        isCurrent ? 'text-orange-600' : isPassed ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">รายการอาหารที่สั่ง</h4>
          <div className="space-y-2 border-t border-b border-gray-100 py-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">
                  {item.itemName} <span className="font-bold text-orange-600">x{item.quantity}</span>
                </span>
                <span className="font-bold text-gray-900">฿{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-gray-500">ยอดรวมทั้งสิ้น (PromptPay):</span>
            <span className="text-lg font-black text-orange-600">฿{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
