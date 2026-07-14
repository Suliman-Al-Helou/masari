// دوال مساعدة عامة تُستخدم في أكثر من مكان
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** يستخرج الأحرف الأولى من الاسم للأفاتار */
export function getInitials(name: string): string {
  if (!name) return '؟'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2)
}


/**
 * Merge conditional class names and resolve Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}