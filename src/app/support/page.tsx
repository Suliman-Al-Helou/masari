// src/app/support/page.tsx
// Server component — لا يحتاج 'use client' لأن كل التفاعل في الـ components

import FAQSection from '@/components/support/FAQSection';
import ContactForm from '@/components/support/ContactForm';

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مركز الدعم</h1>
        <p className="text-sm text-muted-foreground mt-1">نحن هنا لمساعدتك في أي وقت</p>
      </div>

      <FAQSection />

      <ContactForm />
    </div>
  );
}