'use client';

// src/components/semester-plan/SummaryCards.tsx

import { Task } from '@/lib/constants/semester-plan';

interface SummaryCardsProps {
  tasks: Task[];
}

export default function SummaryCards({ tasks }: SummaryCardsProps) {
  const cards = [
    { label: 'الكل',         value: tasks.length,                                            color: 'bg-primary/10 text-primary' },
    { label: 'قيد التنفيذ', value: tasks.filter(t => t.status === 'قيد التنفيذ').length,    color: 'bg-info/10 text-info' },
    { label: 'مكتمل',       value: tasks.filter(t => t.status === 'مكتمل').length,           color: 'bg-success/10 text-success' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(card => (
        <div key={card.label} className="rounded-2xl bg-card border border-border/50 p-4 text-center">
          <p className={`text-2xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}