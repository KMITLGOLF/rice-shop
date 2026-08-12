'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, Loader2, Send, CreditCard, Sparkles, Upload } from 'lucide-react';
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

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  promptpayId,
  promptpayName,
  onClearCart,
}) => {
  const router = useRouter();
  const { profile } = useLiff();

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

  // Auto populate customer name from LINE profile if available
  useEffect(() => {
    if (profile?.displayName && !customerName) {
      setCustomerName(profile.displayName);
    }
  }, [profile]);

  // Fetch Dynamic PromptPay QR when Modal opens
  useEffect(() => {
    if (isOpen && totalAmount > 0) {
      setLoadingQr(true);
      fetch('/api/promptpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, promptpayId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.qrDataUrl) {
            setQrCodeUrl(data.qrDataUrl);
          }
        })
        .catch((err) => console.error('Error loading PromptPay QR:', err))
        .finally(() => setLoadingQr(false));
    }
  }, [isOpen, totalAmount, promptpayId]);

  if (!isOpen) return null;

  const handleSimulatedSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedSlip(base64);
        
        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg';
        const uniqueName = `slip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        
        setSlipFile({
          base64,
          name: uniqueName,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }

    setSubmittingOrder(true);
    try {
      let finalSlipUrl = null;

      // Upload slip to Supabase first if a slip file is selected
      if (slipFile) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: slipFile.base64,
            fileName: slipFile.name,
            fileType: slipFile.type
          })
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.error || 'Failed to upload payment slip');
        }

        const uploadData = await uploadRes.json();
        finalSlipUrl = uploadData.url;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          lineUserId: profile?.userId || null,
          note: orderNote.trim(),
          totalAmount,
          slipUrl: finalSlipUrl || 'PROMPTPAY_VERIFIED',
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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setCompletedOrder(data);
      onClearCart();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {!completedOrder ? (
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-200" />
                  ชำระเงินด้วย PromptPay QR Code
                </h3>
                <p className="text-xs text-amber-100 mt-0.5 font-medium">
                  สแกนจ่ายผ่านแอปพลิเคชันธนาคารทุกแห่ง
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Dynamic PromptPay QR Card */}
              <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/30 rounded-2xl p-4 border border-blue-100 text-center flex flex-col items-center shadow-inner">
                <div className="inline-flex items-center gap-2 bg-[#002d62] text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <QrCode className="w-3.5 h-3.5 text-blue-300" />
                  พร้อมเพย์ (PromptPay)
                </div>

                {loadingQr ? (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-blue-600 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-medium">กำลังสร้าง QR Code...</span>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-blue-100">
                    <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-52 h-52 object-contain" />
                  </div>
                ) : (
                  <div className="text-red-500 text-xs py-10">ไม่สามารถโหลด QR Code ได้</div>
                )}

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">บัญชีผู้รับเงิน:</p>
                  <p className="font-bold text-gray-800 text-sm">{promptpayName}</p>
                  <p className="font-mono text-xs text-blue-700 font-semibold">{promptpayId}</p>
                </div>

                <div className="mt-3 bg-orange-50 text-orange-800 font-black text-xl px-4 py-1.5 rounded-full border border-orange-200 shadow-sm">
                  ยอดชำระ: ฿{totalAmount.toFixed(2)}
                </div>
              </div>

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
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ (ถ้ามี)</label>
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">หมายเหตุเพิ่มเติมถึงร้านค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น ขอน้ำซุปเพิ่ม, ใส่ถุงแยกน้ำ"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 text-gray-700"
                  />
                </div>

                {/* Optional Slip Upload Simulator */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">แนบหลักฐานการโอนเงิน (สลิป)</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      <Upload className="w-4 h-4 text-orange-600" />
                      {uploadedSlip ? 'เปลี่ยนรูปสลิป' : 'อัปโหลดสลิป'}
                      <input type="file" accept="image/*" onChange={handleSimulatedSlipUpload} className="hidden" />
                    </label>
                    {uploadedSlip && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> แนบสลิปเรียบร้อย
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submittingOrder}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-98"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังบันทึกคำสั่งซื้อ...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ชำระเงินเสร็จสิ้น (ยืนยันสั่งซื้อ)
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Post-Payment Order Confirmation Screen */
          <div className="p-8 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                ชำระเงินเสร็จสิ้น (Payment Completed)
              </div>
              <h3 className="text-2xl font-black text-gray-800">ส่งคำสั่งซื้อสำเร็จ!</h3>
              <p className="text-xs text-gray-500 mt-1">ทางร้านได้รับออเดอร์ของท่านแล้ว กำลังดำเนินการเตรียมอาหารครับ</p>
            </div>

            {/* Queue Number Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg border border-orange-300">
              <p className="text-xs font-semibold text-amber-100 uppercase tracking-widest">หมายเลขออเดอร์ / คิวของคุณ</p>
              <div className="text-4xl font-black mt-1 font-mono tracking-wider">
                {completedOrder.queueNumber}
              </div>
              <p className="text-xs text-orange-100 mt-2 font-medium">
                {profile ? '📱 ระบบส่งข้อความยืนยันไปยัง LINE เรียบร้อยแล้ว' : 'กรุณาจำคิวเพื่อรับอาหาร'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/order/${completedOrder.id}`);
                }}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all"
              >
                ติดตามสถานะคิว (Live Order Tracker)
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
