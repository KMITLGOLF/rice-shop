'use client';

import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { MenuItemData } from '../Customer/MenuCard';

interface Category {
  id: string;
  name: string;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: MenuItemData | null;
  categories: Category[];
  onSave: (itemData: any) => Promise<void>;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  initialItem,
  categories,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isRecommended, setIsRecommended] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            fileName,
            fileType: file.type,
          }),
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Failed to upload image');
        }

        const data = await uploadRes.json();
        if (data.url) {
          setImageUrl(data.url);
        }
        setUploadingImage(false);
      };

      reader.onerror = () => {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File upload error:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + (err.message || ''));
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setDescription(initialItem.description || '');
      setPrice(initialItem.price.toString());
      setImageUrl(initialItem.imageUrl);
      setCategoryId((initialItem as any).categoryId || categories[0]?.id || '');
      setIsAvailable(initialItem.isAvailable);
      setIsRecommended(initialItem.isRecommended);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
      setCategoryId(categories[0]?.id || '');
      setIsAvailable(true);
      setIsRecommended(false);
    }
  }, [initialItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      alert('กรุณากรอกข้อมูล ชื่อรายการ, ราคา และ หมวดหมู่ ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: initialItem?.id,
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId,
        isAvailable,
        isRecommended,
      });
      onClose();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-lg">
              {initialItem ? 'แก้ไขรายการอาหาร' : 'เพิ่มรายการอาหารใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ชื่อเมนูอาหาร <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ข้าวกะเพราหมูกรอบ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ราคา (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                required
                placeholder="65"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-bold text-orange-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">คำอธิบายเมนู</label>
            <textarea
              rows={2}
              placeholder="รายละเอียดวัตถุดิบ ความเผ็ด ฯลฯ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">รูปภาพอาหาร</label>
            <div className="space-y-3">
              {/* File Upload Button / Drag Drop area */}
              <div className="flex items-center gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  uploadingImage
                    ? 'border-orange-300 bg-orange-50/50 text-orange-600'
                    : 'border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 text-slate-600'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <span className="text-xs font-bold text-orange-600">กำลังอัปโหลดรูปภาพ...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">คลิกเพื่อเลือกไฟล์รูปภาพ (Upload File)</p>
                        <p className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG, WEBP</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Or enter Direct URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">หรือระบุ URL รูปภาพโดยตรง:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-mono text-slate-700"
                />
              </div>

              {imageUrl && (
                <div className="relative h-36 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg hover:bg-rose-700 transition-colors"
                    >
                      ลบรูปภาพ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-xs font-bold text-gray-800">มีพร้อมจำหน่าย (In Stock)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-amber-50 p-3 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                checked={isRecommended}
                onChange={(e) => setIsRecommended(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900">⭐ เมนูแนะนำ (Recommended)</span>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกข้อมูลเมนู
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
