'use client';

import React from 'react';
import { Clock, CheckCircle, ChefHat, AlertCircle, Phone, MessageSquare, ShieldCheck, XCircle } from 'lucide-react';

export interface OrderItemData {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
  specialRequest?: string | null;
}

export interface OrderData {
  id: string;
  queueNumber: string;
  customerName: string;
  customerPhone?: string | null;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'VERIFYING' | 'PAID' | 'FAILED';
  note?: string | null;
  slipUrl?: string | null;
  items: OrderItemData[];
  createdAt: string;
}

interface OrderCardProps {
  order: OrderData;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onUpdatePayment: (orderId: string, newPaymentStatus: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onUpdatePayment }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> รอรับออเดอร์ (Pending)
          </span>
        );
      case 'PREPARING':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-200">
            <ChefHat className="w-3.5 h-3.5 text-blue-600" /> กำลังปรุง (Preparing)
          </span>
        );
      case 'READY':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" /> พร้อมรับอาหาร (Ready)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> เสร็จสิ้น (Completed)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> ยกเลิก (Cancelled)
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentBadge = (status: string, slipUrl?: string | null) => {
    if (status === 'PAID') {
      return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ จ่ายแล้ว (Paid)</span>;
    }
    if (status === 'VERIFYING') {
      return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">🔍 ตรวจสอบสลิป</span>;
    }
    if (slipUrl === 'CASH_PAYMENT') {
      return <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">💵 จ่ายเงินสดหน้าร้าน</span>;
    }
    return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">ยังไม่จ่าย (รอโอน)</span>;
  };

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header: Queue Number & Order Status */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black font-mono text-xl px-3 py-1 rounded-xl shadow-sm">
              {order.queueNumber}
            </div>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">{order.customerName}</h4>
              <p className="text-[11px] text-gray-400 font-medium">เวลา: {formattedTime} น.</p>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        {/* Contact & Payment Bar */}
        <div className="py-2.5 flex items-center justify-between text-xs border-b border-gray-50">
          <div className="flex items-center gap-2 text-gray-600">
            {order.customerPhone ? (
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                {order.customerPhone}
              </a>
            ) : (
              <span className="text-gray-400">ไม่มีเบอร์โทร</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getPaymentBadge(order.paymentStatus, order.slipUrl)}
            {order.slipUrl && order.slipUrl.startsWith('http') && (
              <a
                href={order.slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded transition-colors"
              >
                ดูสลิป
              </a>
            )}
            {order.paymentStatus === 'VERIFYING' && (
              <button
                onClick={() => onUpdatePayment(order.id, 'PAID')}
                className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded transition-colors"
              >
                ยืนยันการโอน
              </button>
            )}
            {order.paymentStatus === 'UNPAID' && order.slipUrl === 'CASH_PAYMENT' && (
              <button
                onClick={() => onUpdatePayment(order.id, 'PAID')}
                className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded transition-colors"
              >
                รับเงินสดแล้ว
              </button>
            )}
          </div>
        </div>

        {/* Order Items List */}
        <div className="py-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between text-xs">
              <div className="flex-1">
                <span className="font-bold text-gray-800">
                  {item.itemName} <span className="text-orange-600 font-extrabold">x{item.quantity}</span>
                </span>
                {item.specialRequest && (
                  <p className="text-[11px] text-amber-700 font-medium bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                    ⚠️ {item.specialRequest}
                  </p>
                )}
              </div>
              <span className="font-semibold text-gray-700 ml-2">฿{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}

          {order.note && (
            <div className="bg-orange-50/70 border border-orange-100 rounded-lg p-2 mt-2 text-xs text-orange-800 flex items-start gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
              <span>
                <strong>หมายเหตุลูกค้า:</strong> {order.note}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls & Price Total */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-semibold">ยอดรวมทั้งสิ้น:</span>
          <span className="text-lg font-black text-orange-600">฿{order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Action Controls based on Status */}
        <div className="grid grid-cols-2 gap-2">
          {order.status === 'PENDING' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <ChefHat className="w-3.5 h-3.5" /> เริ่มทำอาหาร
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
              >
                ยกเลิกคำสั่งซื้อ
              </button>
            </>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'READY')}
              className="col-span-2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <AlertCircle className="w-3.5 h-3.5" /> อาหารเสร็จแล้ว (แจ้งลูกค้า)
            </button>
          )}

          {order.status === 'READY' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
              className="col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" /> ลูกค้ารับอาหารแล้ว (ปิดคิว)
            </button>
          )}

          {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
            <div className="col-span-2 text-center text-xs font-semibold text-gray-400 py-1.5 bg-gray-50 rounded-xl">
              ออเดอร์นี้เสร็จสิ้นแล้ว
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
