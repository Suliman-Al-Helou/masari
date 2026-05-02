// src/lib/constants/support.ts

import { FileQuestion, BookOpen, MessageCircle, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
export interface FAQ {
  q: string;
  a: string;
}

export interface SupportCategory {
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface SupportForm {
  subject: string;
  message: string;
  category: string;
}

// ─── Data ─────────────────────────────────────────────────
export const FAQS: FAQ[] = [
  {
    q: 'كيف أضيف مادة جديدة لمساري الدراسي؟',
    a: 'اذهب إلى صفحة "المسار الدراسي" واضغط على زر "إضافة مادة"، ثم أدخل تفاصيل المادة واضغط إضافة.',
  },
  {
    q: 'هل يمكنني تعديل خطة الفصل لاحقاً؟',
    a: 'نعم، يمكنك تعديل وإعادة ترتيب مهامك في أي وقت من صفحة "مخطط الفصل".',
  },
  {
    q: 'كيف أدعو زملائي للمنصة؟',
    a: 'من صفحة "شبكة الطلاب"، اضغط على "دعوة طالب" وأدخل بريده الإلكتروني.',
  },
  {
    q: 'هل يمكنني تصدير بياناتي الأكاديمية؟',
    a: 'نعمل حالياً على إضافة ميزة التصدير. ستتوفر قريباً في تحديث قادم.',
  },
  {
    q: 'كيف يتم حساب نسبة التقدم؟',
    a: 'يتم حساب النسبة بناءً على عدد المواد المكتملة من إجمالي المواد المسجلة في مسارك الدراسي.',
  },
];

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { label: 'مشكلة تقنية',     icon: FileQuestion,   color: 'bg-destructive/10 text-destructive' },
  { label: 'استفسار أكاديمي', icon: BookOpen,        color: 'bg-primary/10 text-primary' },
  { label: 'اقتراح تحسين',    icon: MessageCircle,   color: 'bg-success/10 text-success' },
  { label: 'أخرى',            icon: HelpCircle,      color: 'bg-warning/10 text-warning' },
];

export const DEFAULT_FORM: SupportForm = {
  subject: '',
  message: '',
  category: '',
};