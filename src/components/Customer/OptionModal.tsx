'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { MenuItemData } from './MenuCard';

interface OptionItem {
  name: string;
  price: number;
}

interface OptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItemData | null;
  onConfirm: (item: MenuItemData, selectedOption: string, optionPrice: number) => void;
}

const DEFAULT_OPTIONS: OptionItem[] = [
  { name: 'ไส้กรอก', price: 65 },
  { name: 'เบคอน', price: 70 },
  { name: 'หมึก', price: 80 },
  { name: 'กุ้ง', price: 80 },
  { name: 'หมึก+กุ้ง', price: 95 },
];

export const OptionModal: React.FC<OptionModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Reset selection every time a new item is shown
  useEffect(() => {
    setSelectedOption('');
  }, [item?.id, isOpen]);

  if (!isOpen || !item) return null;

  // Normalize options to {name, price}[]
  const rawOptions = (item as any).options;
  const options: OptionItem[] =
    Array.isArray(rawOptions) && rawOptions.length > 0
      ? typeof rawOptions[0] === 'string'
        ? (rawOptions as string[]).map((s) => ({ name: s, price: item.price }))
        : (rawOptions as OptionItem[])
      : DEFAULT_OPTIONS;

  const selectedObj = options.find((o) => o.name === selectedOption);

  const handleConfirm = () => {
    if (!selectedOption || !selectedObj) {
      alert('กรุณาเลือกตัวเลือกก่อนยืนยัน');
      return;
    }
    onConfirm(item, selectedOption, selectedObj.price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header image */}
        <div className="relative h-40 bg-slate-100 overflow-hidden">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
            <h3 className="font-extrabold text-lg sm:text-xl leading-tight">{item.name}</h3>
            <p className="text-xs text-orange-300 font-bold mt-0.5">
              {selectedObj ? `฿${selectedObj.price.toFixed(0)}` : `เริ่มต้น ฿${Math.min(...options.map(o => o.price)).toFixed(0)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              เลือกเนื้อสัตว์ / ท็อปปิ้ง <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option) => {
                const isSelected = selectedOption === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setSelectedOption(option.name)}
                    className={`p-3 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <span>{option.name}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-black ${isSelected ? 'text-orange-600' : 'text-slate-500'}`}>
                        ฿{option.price}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] ml-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-200 active:scale-98 transition-all"
          >
            {selectedObj
              ? `เพิ่มลงตะกร้า • ฿${selectedObj.price.toFixed(0)}`
              : 'เลือกตัวเลือกก่อน'}
          </button>
        </div>
      </div>
    </div>
  );
};
