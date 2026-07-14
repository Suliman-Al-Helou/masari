'use client';

// src/components/semester-plan/TaskTabs.tsx

import { TABS } from '@/lib/constants/semester-plan';
import type { TabValue } from '@/types';

interface TaskTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
}

export default function TaskTabs({ value, onChange }: TaskTabsProps) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === tab.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}