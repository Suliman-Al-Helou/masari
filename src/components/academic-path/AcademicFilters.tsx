'use client';

import { Search } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants/dashboard';

interface Props {
  search: string;
  filterStatus: string;
  onSearch: (v: string) => void;
  onFilter: (v: string) => void;
}

export default function AcademicFilters({ search, filterStatus, onSearch, onFilter }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ابحث عن مادة..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <select
        value={filterStatus}
        onChange={e => onFilter(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="all">الكل</option>
        {Object.keys(STATUS_CONFIG).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}