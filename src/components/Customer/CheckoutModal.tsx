'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, Loader2, CreditCard, Upload, Banknote, Wallet } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { useLiff } from './LiffProvider';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  promptpayId: string;
  promptpayName: string;
  onClearCart: () => void;
}

type PaymentMethod = 'PROMPTPAY' | 'CASH';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  promptpayId,
  promptpayName,
  onClearCart,
}) => {
  const router = useRouter();
  const { profile, isLoggedIn, accessToken, login } = useLiff();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PROMPTPAY');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<{ base64: string; name: string; type: string } | null>(null);

  const totalAmount = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // Auto populate customer name from LINE profile
  useEffect(() => {
    if (profile?.displayName && !customerName) {
      setCustomerName(profile.displayName);
    }
  }, [profile]);

  // Fetch PromptPay QR only when PROMPTPAY is selected
  useEffect(() => {
    if (isOpen && totalAmount > 0 && paymentMethod === 'PROMPTPAY') {
      setLoadingQr(true);
      fetch('/api/promptpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, promptpayId }),
      })
        .then((res) => res.json())
        .then((data) => { if (data.qrDataUrl) setQrCodeUrl(data.qrDataUrl); })
        .catch((err) => console.error('Error loading PromptPay QR:', err))
        .finally(() => setLoadingQr(false));
    }
  }, [isOpen, totalAmount, promptpayId, paymentMethod]);

  if (!isOpen) return null;

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedSlip(base64);
        const extension = file.name.split('.').pop() || 'jpg';
        const uniqueName = `slip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        setSlipFile({ base64, name: uniqueName, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async () => {
    if (!isLoggedIn || !profile?.userId) {
      alert('กรุณาเข้าสู่ระบบ LINE ก่อนยืนยันคำสั่งซื้อ');
      login();
      return;
    }
    if (!customerName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (paymentMethod === 'PROMPTPAY' && !slipFile) {
      alert('กรุณาแนบสลิปการโอนเงินก่อนยืนยันคำสั่งซื้อ');
      return;
    }

    setSubmittingOrder(true);
    try {
      let finalSlipUrl: string | null = null;

      if (paymentMethod === 'PROMPTPAY' && slipFile) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: slipFile.base64, fileName: slipFile.name, fileType: slipFile.type }),
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Failed to upload payment slip');
        }
        const uploadData = await uploadRes.json();
        finalSlipUrl = uploadData.url;
      }

      // Determine slipUrl based on payment method
      let slipUrlValue: string;
      if (paymentMethod === 'CASH') {
        slipUrlValue = 'CASH_PAYMENT';
      } else if (finalSlipUrl) {
        slipUrlValue = finalSlipUrl;
      } else {
        throw new Error('กรุณาแนบสลิปการโอนเงินก่อนยืนยันคำสั่งซื้อ');
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          lineUserId: profile?.userId || null,
          lineAccessToken: accessToken,
          note: orderNote.trim(),
          totalAmount,
          slipUrl: slipUrlValue,
          paymentMethod,
          items: cart.map((item) => ({
            menuItemId: item.menuItem.id,
            itemName: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            specialRequest: item.specialRequest || '',
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setCompletedOrder(data);
      onClearCart();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg overflow-hidden shadow-2xl border border-gray-100">
        {!completedOrder ? (
          <div className="flex flex-col max-h-[95vh] sm:max-h-[85vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-200" />
                  ยืนยันและชำระเงิน
                </h3>
                <p className="text-xs text-amber-100 mt-0.5 font-medium">
                  ยอดรวม: <span className="font-black text-white">฿{totalAmount.toFixed(0)}</span>
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

              {/* Payment Method Selector */}
              <div>
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">เลือกวิธีชำระเงิน</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'PROMPTPAY'
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'PROMPTPAY' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Wallet className={`w-5 h-5 ${paymentMethod === 'PROMPTPAY' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-extrabold ${paymentMethod === 'PROMPTPAY' ? 'text-blue-700' : 'text-gray-600'}`}>PromptPay</p>
                      <p className="text-[10px] text-gray-400 font-medium">สแกน QR Code</p>
                    </div>
                    {paymentMethod === 'PROMPTPAY' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 absolute top-2 right-2" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'CASH' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'CASH' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-extrabold ${paymentMethod === 'CASH' ? 'text-emerald-700' : 'text-gray-600'}`}>เงินสด</p>
                      <p className="text-[10px] text-gray-400 font-medium">จ่ายที่หน้าร้าน</p>
                    </div>
                    {paymentMethod === 'CASH' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute top-2 right-2" />
                    )}
                  </button>
                </div>
              </div>

              {/* PromptPay Section */}
              {paymentMethod === 'PROMPTPAY' && (
                <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 border border-blue-100 text-center flex flex-col items-center shadow-inner">
                  <div className="inline-flex items-center gap-2 bg-[#002d62] text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                    <QrCode className="w-3.5 h-3.5 text-blue-300" />
                    พร้อมเพย์ (PromptPay)
                  </div>

                  {loadingQr ? (
                    <div className="w-40 h-40 flex flex-col items-center justify-center text-blue-600 gap-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-medium">กำลังสร้าง QR Code...</span>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-blue-100">
                      <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
                    </div>
                  ) : (
                    <div className="text-red-500 text-xs py-8">ไม่สามารถโหลด QR Code ได้</div>
                  )}

                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">บัญชีผู้รับ: <span className="font-bold text-gray-800">{promptpayName}</span></p>
                    <p className="font-mono text-xs text-blue-700 font-semibold">{promptpayId}</p>
                  </div>

                  <div className="mt-2 bg-orange-50 text-orange-800 font-black text-lg px-4 py-1.5 rounded-full border border-orange-200">
                    ฿{totalAmount.toFixed(2)}
                  </div>

                  {/* Slip Upload */}
                  <div className="mt-3 w-full">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">📎 แนบสลิปการโอนเงิน <span className="text-red-500">*</span></label>
                    <label className={`cursor-pointer flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-xs font-semibold transition-all ${
                      uploadedSlip
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-orange-400 hover:bg-orange-50'
                    }`}>
                      {uploadedSlip ? (
                        <><CheckCircle2 className="w-4 h-4" /> แนบสลิปเรียบร้อย (กดเพื่อเปลี่ยน)</>
                      ) : (
                        <><Upload className="w-4 h-4 text-orange-500" /> อัปโหลดรูปสลิป</>
                      )}
                      <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" capture="environment" />
                    </label>
                  </div>
                </div>
              )}

              {/* Cash Section */}
              {paymentMethod === 'CASH' && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Banknote className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="font-extrabold text-emerald-800 text-base">ชำระเงินสดที่หน้าร้าน</h4>
                  <p className="text-xs text-emerald-700 font-medium">กรุณาเตรียมเงินสดให้พอดี</p>
                  <div className="bg-white rounded-xl py-3 px-4 border border-emerald-200 mt-2">
                    <p className="text-xs text-gray-500 font-medium">ยอดที่ต้องชำระ</p>
                    <p className="text-2xl font-black text-emerald-700">฿{totalAmount.toFixed(2)}</p>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    ✅ สามารถสั่งอาหารก่อน แล้วจ่ายตอนรับอาหารที่หน้าร้าน
                  </p>
                </div>
              )}

              {/* Customer Info Form */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">ข้อมูลผู้สั่งซื้อ</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ชื่อผู้สั่งซื้อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น คุณสมชาย"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ (ถ้ามี)</label>
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">หมายเหตุถึงร้านค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น ขอน้ำซุปเพิ่ม, ใส่ถุงแยกน้ำ"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-orange-500 text-gray-700"
                  />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submittingOrder || (paymentMethod === 'PROMPTPAY' && !slipFile)}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  paymentMethod === 'CASH'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-200'
                    : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submittingOrder ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> กำลังบันทึกคำสั่งซื้อ...</>
                ) : paymentMethod === 'CASH' ? (
                  <><Banknote className="w-5 h-5" /> ยืนยันสั่งอาหาร (จ่ายเงินสด)</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> โอนแล้ว ยืนยันสั่งซื้อ</>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4 sm:space-y-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
              completedOrder.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
            }`}>
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${
                completedOrder.paymentMethod === 'CASH'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {completedOrder.paymentMethod === 'CASH' ? '💵 เงินสด - ชำระที่หน้าร้าน' : '✅ PromptPay - รอตรวจสอบสลิป'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-800">ส่งคำสั่งซื้อสำเร็จ!</h3>
              <p className="text-xs text-gray-500 mt-1">ทางร้านได้รับออเดอร์แล้ว กำลังเตรียมอาหารครับ</p>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-orange-300">
              <p className="text-xs font-semibold text-amber-100 uppercase tracking-widest">หมายเลขคิวของคุณ</p>
              <div className="text-4xl sm:text-5xl font-black mt-1 font-mono tracking-wider">
                {completedOrder.queueNumber}
              </div>
              <p className="text-xs text-orange-100 mt-1 font-medium">
                {profile ? '📱 ระบบส่งข้อความยืนยันไปยัง LINE เรียบร้อยแล้ว' : 'กรุณาจำคิวเพื่อรับอาหาร'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onClose(); router.push(`/order/${completedOrder.id}`); }}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all"
              >
                ติดตามสถานะคิว (Live Tracker)
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
              >
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
