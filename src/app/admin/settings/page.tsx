'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '@/components/Admin/AdminNavbar';
import { Settings, Store, QrCode, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'HOLIDAY' | 'QUEUE_ONLY'>('OPEN');
  const [closedMessage, setClosedMessage] = useState('');
  const [promptpayId, setPromptpayId] = useState('');
  const [promptpayName, setPromptpayName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/store-status')
      .then((res) => res.json())
      .then((data) => {
        setStoreName(data.storeName || '');
        setStatus(data.status || 'OPEN');
        setClosedMessage(data.closedMessage || '');
        setPromptpayId(data.promptpayId || '');
        setPromptpayName(data.promptpayName || '');
      })
      .catch((err) => console.error('Failed to load store settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/store-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          status,
          closedMessage,
          promptpayId,
          promptpayName,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <AdminNavbar />

      <main className="max-w-4xl mx-auto w-full flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            ตั้งค่าสถานะร้านค้า & PromptPay (Store Management)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            เปิด-ปิดร้านค้าชั่วคราว ตั้งข้อความแจ้งลูกค้า และกำหนดเบอร์พร้อมเพย์
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            กำลังโหลดข้อมูลการตั้งค่า...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Store Status Radio Guards */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-600" />
                สถานะเปิด-ปิดรับออเดอร์ (Store Status Guard)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  {
                    key: 'OPEN',
                    title: '🟢 เปิดให้บริการ (OPEN)',
                    desc: 'ลูกค้าสามารถดูเมนูและส่งออเดอร์ได้ตามปกติ',
                    activeBorder: 'border-emerald-500 bg-emerald-50 text-emerald-900',
                  },
                  {
                    key: 'QUEUE_ONLY',
                    title: '🟣 รับจองคิว (QUEUE ONLY)',
                    desc: 'ร้านยังไม่เปิดให้รับทันที แต่ลูกค้าสั่งล่วงหน้าและเข้าคิวได้',
                    activeBorder: 'border-violet-500 bg-violet-50 text-violet-900',
                  },
                  {
                    key: 'CLOSED',
                    title: '🔴 ร้านปิด (CLOSED)',
                    desc: 'งดรับออเดอร์ และแสดงข้อความแจ้งเตือนหน้าแรก',
                    activeBorder: 'border-rose-500 bg-rose-50 text-rose-900',
                  },
                  {
                    key: 'HOLIDAY',
                    title: '🟡 วันหยุดร้าน (HOLIDAY)',
                    desc: 'งดรับออเดอร์เนื่องจากเป็นวันหยุดประจำร้าน',
                    activeBorder: 'border-amber-500 bg-amber-50 text-amber-900',
                  },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      status === option.key
                        ? option.activeBorder
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="storeStatus"
                        value={option.key}
                        checked={status === option.key}
                        onChange={() => setStatus(option.key as any)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="font-extrabold text-xs">{option.title}</span>
                    </div>
                    <p className="text-[11px] mt-2 font-medium opacity-80 leading-relaxed">
                      {option.desc}
                    </p>
                  </label>
                ))}
              </div>

              {/* Custom Closed Message */}
              {status !== 'OPEN' && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ข้อความแจ้งลูกค้าเมื่อสถานะร้านเปลี่ยน
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น ขออภัย วันนี้ร้านปิดให้บริการ จะกลับมาเปิดใหม่อีกครั้งพรุ่งนี้ครับ"
                    value={closedMessage}
                    onChange={(e) => setClosedMessage(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-orange-500 text-slate-800 font-medium"
                  />
                </div>
              )}
            </div>

            {/* 2. Store Info & PromptPay Config */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                ข้อมูลร้านค้า & บัญชีพร้อมเพย์ (PromptPay Payment Settings)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อร้านค้า</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมายเลข PromptPay (เบอร์โทร / เลขประจำตัวผู้เสียภาษี)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 0812345678"
                      value={promptpayId}
                      onChange={(e) => setPromptpayId(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-mono font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อบัญชีผู้รับเงิน PromptPay
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ชื่อร้านของคุณ"
                      value={promptpayName}
                      onChange={(e) => setPromptpayName(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button & Feedback */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="py-3.5 px-8 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-98"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                บันทึกการตั้งค่าร้านค้า
              </button>

              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> บันทึกข้อมูลสำเร็จแล้ว
                </span>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
