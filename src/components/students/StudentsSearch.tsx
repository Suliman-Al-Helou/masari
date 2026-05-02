'use client';

// src/components/students/StudentsSearch.tsx

import { Search } from 'lucide-react';

interface StudentsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StudentsSearch({ value, onChange }: StudentsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder="ابحث عن طالب بالاسم أو الإيميل..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}