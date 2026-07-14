'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
  options:     string[];
  className?:  string;
}

export default function CustomSelect({
  value, onChange, placeholder, options, className = '',
}: CustomSelectProps) {
  const [open, setOpen]     = useState(false);
  const containerRef        = useRef<HTMLDivElement>(null);

  // أغلق عند الضغط برا
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = value || null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-10 px-3 rounded-xl border text-sm flex items-center justify-between gap-2 transition-all
          ${open
            ? 'border-primary ring-2 ring-primary/20 bg-card'
            : 'border-border bg-background hover:border-primary/40'
          }
          text-${selected ? 'foreground' : 'muted-foreground'}
        `}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* خيار "الكل" */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted
              ${!selected ? 'text-primary font-medium' : 'text-muted-foreground'}
            `}
          >
            <span>{placeholder}</span>
            {!selected && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="border-t border-border" />

          {/* القائمة */}
          <div className="max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt === selected;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors
                    ${isSelected
                      ? 'bg-primary/8 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <span className="text-start">{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
