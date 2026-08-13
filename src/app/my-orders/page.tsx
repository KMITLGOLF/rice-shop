'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3, ListOrdered, RefreshCw } from 'lucide-react';
import { useLiff } from '@/components/Customer/LiffProvider';

type Order = { id: string; queueNumber: string; totalAmount: number; status: string; items: { itemName: string; quantity: number }[] };
const labels: Record<string, string> = { PENDING: 'รอร้านรับออเดอร์', PREPARING: 'กำลังทำอาหาร', READY: 'พร้อมรับอาหาร', COMPLETED: 'รับอาหารแล้ว', CANCELLED: 'ยกเลิกแล้ว' };
const active = new Set(['PENDING', 'PREPARING', 'READY']);

export default function MyOrdersPage() {
  const { isLoggedIn, accessToken, login } = useLiff();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const loadOrders = async () => { if (!accessToken) return; setLoading(true); try { const res = await fetch('/api/my-orders', { headers: { Authorization: `Bearer ${accessToken}` } }); if (res.ok) setOrders(await res.json()); } finally { setLoading(false); } };
  useEffect(() => { if (accessToken) loadOrders(); else setLoading(false); }, [accessToken]);
  if (!isLoggedIn) return <main className="min-h-screen bg-slate-50 grid place-items-center p-6 text-center"><div className="space-y-4"><ListOrdered className="w-12 h-12 mx-auto text-orange-600" /><p className="font-bold text-slate-700">เข้าสู่ระบบ LINE เพื่อดูคิวของคุณ</p><button onClick={login} className="px-5 py-3 rounded-xl bg-[#06C755] text-white font-bold">เข้าสู่ระบบ LINE</button></div></main>;
  return <main className="min-h-screen bg-slate-50 p-4"><div className="max-w-md mx-auto space-y-4"><div className="flex items-center justify-between"><Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600"><ArrowLeft className="w-4 h-4" /> กลับหน้าร้าน</Link><button onClick={loadOrders} className="p-2 rounded-xl bg-white border border-slate-200 text-orange-600"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div><div><h1 className="font-black text-2xl text-slate-800">คิวของฉัน</h1><p className="text-sm text-slate-500">กลับเข้ามาเมื่อไร ก็เห็นสถานะคิวล่าสุด</p></div>{!loading && orders.length === 0 ? <div className="bg-white rounded-3xl p-10 text-center border border-slate-200"><Clock3 className="w-10 h-10 mx-auto text-slate-300 mb-3" /><p className="font-bold text-slate-600">ยังไม่มีประวัติคำสั่งซื้อ</p></div> : <div className="space-y-3">{orders.map((order) => <Link key={order.id} href={`/order/${order.id}`} className={`block bg-white rounded-2xl p-4 border shadow-sm ${active.has(order.status) ? 'border-orange-300' : 'border-slate-200'}`}><div className="flex justify-between gap-3"><div><p className="font-black text-xl text-orange-600">{order.queueNumber}</p><p className="text-xs font-bold text-slate-700 mt-1">{labels[order.status] || order.status}</p></div><span className={`text-xs font-bold px-2 py-1 h-fit rounded-full ${active.has(order.status) ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{active.has(order.status) ? 'กำลังดำเนินการ' : 'ประวัติ'}</span></div><p className="text-xs text-slate-500 mt-3 truncate">{order.items.map((item) => `${item.itemName} x${item.quantity}`).join(', ')}</p><p className="text-sm font-black text-slate-800 mt-2">฿{order.totalAmount.toFixed(2)}</p></Link>)}</div>}</div></main>;
}
