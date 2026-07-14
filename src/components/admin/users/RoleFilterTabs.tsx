"use client";
import { motion } from "motion/react";
import { buttonVariants } from "@/lib/motion";
type RoleFilter = "all" | "admin" | "student";

const OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "student", label: "طلاب" },
  { value: "admin", label: "مشرفون" },
];

export default function RoleFilterTabs({
  value,
  onChange,
}: {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
}) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          type="button"
          aria-pressed={value === opt.value}
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}
