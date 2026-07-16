"use client";

import type { AdminUsersStatus } from "@/types/admin";

interface UserStatusTabsProps {
  value: AdminUsersStatus;
  onChange: (value: AdminUsersStatus) => void;
}

export default function UserStatusTabs({ value, onChange }: UserStatusTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist">
      {([
        { value: "active", label: "الحسابات النشطة" },
        { value: "deleted", label: "المستخدمون المحذوفون" },
      ] as const).map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-10 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
