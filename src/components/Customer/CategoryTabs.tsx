'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 scroll-smooth">
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
          selectedCategoryId === 'ALL'
            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-200'
            : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
        }`}
      >
        🍽️ ทั้งหมด (All)
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
            selectedCategoryId === cat.id
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-200'
              : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
