'use client';

import { CATEGORIES, type CategoryKey } from '@/types';

interface CategoryFilterProps {
  active: CategoryKey;
  onSelect: (category: CategoryKey) => void;
}

export default function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
            active === cat.key
              ? 'border-black bg-black text-white'
              : 'border-border bg-white text-text-secondary hover:border-black hover:text-black'
          }`}
        >
          <span className="text-xs">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
