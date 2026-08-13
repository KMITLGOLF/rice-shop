'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, Save, UserRound } from 'lucide-react';
import { useLiff } from '@/components/Customer/LiffProvider';

export default function ProfilePage() {
  const { isLoggedIn, profile, accessToken, login, logout, updateProfile } = useLiff();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    fetch(`/api/profile?lineUserId=${encodeURIComponent(profile.userId)}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => { if (user?.phone) setPhone(user.phone); })
      .catch(() => undefined);
  }, [profile, accessToken]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile || !displayName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ lineUserId: profile.userId, displayName, phone, pictureUrl: profile.pictureUrl }),
      });
      if (!res.ok) throw new Error();
      updateProfile({ displayName: displayName.trim() });
      alert('บันทึกโปรไฟล์เรียบร้อยแล้ว');
    } catch {
      alert('บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally { setSaving(false); }
  };

  if (!isLoggedIn || !profile) return <main className="min-h-screen bg-slate-50 grid place-items-center p-6 text-center"><div className="space-y-4"><UserRound className="w-12 h-12 mx-auto text-orange-600" /><p className="font-bold text-slate-700">กรุณาเข้าสู่ระบบ LINE เพื่อจัดการโปรไฟล์</p><button onClick={login} className="px-5 py-3 rounded-xl bg-[#06C755] text-white font-bold">เข้าสู่ระบบ LINE</button></div></main>;

  return <main className="min-h-screen bg-slate-50 p-4"><div className="max-w-md mx-auto space-y-4"><Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600"><ArrowLeft className="w-4 h-4" /> กลับหน้าร้าน</Link><form onSubmit={save} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5"><div className="text-center"><img src={profile.pictureUrl} alt="รูปโปรไฟล์" className="w-20 h-20 rounded-full mx-auto object-cover bg-slate-100" /><h1 className="font-black text-xl text-slate-800 mt-3">โปรไฟล์ของฉัน</h1></div><label className="block text-sm font-bold text-slate-700">ชื่อที่ใช้สั่งอาหาร<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 font-medium" required /></label><label className="block text-sm font-bold text-slate-700">เบอร์โทรศัพท์<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 font-medium" placeholder="08X-XXX-XXXX" /></label><button disabled={saving} className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}</button><button type="button" onClick={logout} className="w-full py-3 rounded-xl border border-rose-200 text-rose-600 font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />ออกจากระบบ LINE</button></form></div></main>;
}
