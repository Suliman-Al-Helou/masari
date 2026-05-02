'use client';

// src/components/support/CategoryPicker.tsx

import { SUPPORT_CATEGORIES } from '@/lib/constants/support';

interface CategoryPickerProps {
  selected: string;
  onChange: (label: string) => void;
}

export default function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-3 block">تصنيف الطلب</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUPPORT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isSelected = selected === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => onChange(cat.label)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/50 hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}