// src/lib/constants/support.ts
import { FileQuestion, BookOpen, MessageCircle, HelpCircle } from 'lucide-react'
import type { FAQ, SupportCategory, SupportForm } from '@/types'

export const FAQS: FAQ[] = [
  { q: 'كيف أضيف مادة جديدة لمساري الدراسي؟',  a: 'اذهب إلى صفحة "المسار الدراسي" واضغط على زر "إضافة مادة".' },
  { q: 'هل يمكنني تعديل خطة الفصل لاحقاً؟',    a: 'نعم، يمكنك تعديل مهامك في أي وقت من صفحة "مخطط الفصل".' },
  { q: 'كيف أدعو زملائي للمنصة؟',               a: 'من صفحة "شبكة الطلاب"، اضغط على "دعوة طالب" وأدخل بريده.' },
  { q: 'هل يمكنني تصدير بياناتي الأكاديمية؟',   a: 'نعمل على إضافة ميزة التصدير. ستتوفر قريباً.' },
  { q: 'كيف يتم حساب نسبة التقدم؟',             a: 'بناءً على عدد المواد المكتملة من إجمالي المواد المسجلة.' },
]

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { label: 'مشكلة تقنية',     icon: FileQuestion,  color: 'bg-destructive/10 text-destructive' },
  { label: 'استفسار أكاديمي', icon: BookOpen,       color: 'bg-primary/10 text-primary' },
  { label: 'اقتراح تحسين',    icon: MessageCircle,  color: 'bg-success/10 text-success' },
  { label: 'أخرى',            icon: HelpCircle,     color: 'bg-warning/10 text-warning' },
]

export const DEFAULT_SUPPORT_FORM: SupportForm = {  // ← غيّرنا الاسم لأن dashboard.ts عنده DEFAULT_FORM أيضاً
  subject: '',
  message: '',
  category: '',
}