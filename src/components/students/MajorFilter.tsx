'use client';

import { getMajorGroup } from '@/lib/constants/students';

interface MajorFilterProps {
  selected: string | null;           // التخصص المحدد حالياً
  onChange: (major: string | null) => void;
  currentMajor: string | null;       // تخصص المستخدم
}

export default function MajorFilter({ selected, onChange, currentMajor }: MajorFilterProps) {
  // نجيب الفئة الخاصة بتخصص المستخدم فقط
  const myGroup = getMajorGroup(currentMajor);

  // إذا التخصص مش معروف في أي فئة → ما نعرض الفلتر
  if (!myGroup) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium">
        فئتك: <span className="text-foreground">{myGroup.label}</span>
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {/* زر "كل تخصصات فئتي" */}
        <button
          onClick={() => onChange(null)}
          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            selected === null
              ? 'bg-primary text-primary-foreground border-transparent'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          كل {myGroup.label}
        </button>

        {/* تخصصات الفئة فقط */}
        {myGroup.majors.map(major => (
          <button
            key={major}
            onClick={() => onChange(selected === major ? null : major)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors flex items-center gap-1 ${
              selected === major
                ? major === currentMajor
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'bg-primary/10 text-primary border-primary/30'
                : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {major === currentMajor && <span>⭐</span>}
            {major}
          </button>
        ))}
      </div>
    </div>
  );
}