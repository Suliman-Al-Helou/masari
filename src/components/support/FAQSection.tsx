'use client';

// src/components/support/FAQSection.tsx

import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQS } from '@/lib/constants/support';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        الأسئلة الشائعة
      </h2>

      <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/30 overflow-hidden">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer — CSS height transition */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}