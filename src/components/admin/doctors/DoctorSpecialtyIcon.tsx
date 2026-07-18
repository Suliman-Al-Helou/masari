import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Code2,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Languages,
  Leaf,
  Palette,
  Pill,
  Scale,
  ShieldCheck,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { createElement } from "react";
import { cn } from "@/lib/utils";

interface DoctorSpecialtyIconProps {
  major: string;
  className?: string;
}

const SPECIALTY_ICON_RULES: Array<{
  pattern: RegExp;
  icon: LucideIcon;
}> = [
  {
    pattern: /أمن المعلومات|أمن البيانات|الأمن السيبراني|شبكات/,
    icon: ShieldCheck,
  },
  {
    pattern:
      /حاسوب|الحاسب|برمجيات|برمجة|ذكاء اصطناعي|نظم المعلومات|تطوير ويب|بيانات/,
    icon: Code2,
  },
  {
    pattern:
      /هندسة|ميكاترونكس|طاقة متجددة|إلكترونيات|عمارة|مدنية|مساحة/,
    icon: Wrench,
  },
  {
    pattern: /صيدلة|صيدلي|فارما/,
    icon: Pill,
  },
  {
    pattern: /تمريض|قبالة/,
    icon: HeartPulse,
  },
  {
    pattern:
      /طب|طبي|أسنان|جراحة|مختبرات|تحاليل|أشعة|علاج طبيعي|تغذية سريرية/,
    icon: Stethoscope,
  },
  {
    pattern: /محاسبة|مالية|مصرفية|اقتصاد/,
    icon: Calculator,
  },
  {
    pattern: /إدارة|تسويق|سكرتارية|أعمال/,
    icon: Briefcase,
  },
  {
    pattern: /إنجليزية|عربية|لغات|ترجمة|لغويات|أدب/,
    icon: Languages,
  },
  {
    pattern: /قانون|حقوق|شريعة/,
    icon: Scale,
  },
  {
    pattern: /تصميم|فنون|وسائط|إعلام|صحافة|إعلان/,
    icon: Palette,
  },
  {
    pattern: /علم نفس|إرشاد|اجتماع|خدمة اجتماعية/,
    icon: Brain,
  },
  {
    pattern: /زراعة|نبات|حيوان|دواجن|أغذية|بيطري/,
    icon: Leaf,
  },
  {
    pattern: /كيمياء|فيزياء|أحياء|علوم حياتية|مختبر/,
    icon: FlaskConical,
  },
  {
    pattern: /تعليم|تربية|معلم/,
    icon: BookOpen,
  },
];

function getSpecialtyIcon(major: string): LucideIcon {
  const matchedRule = SPECIALTY_ICON_RULES.find(({ pattern }) =>
    pattern.test(major),
  );

  return matchedRule?.icon ?? GraduationCap;
}

export function DoctorSpecialtyIcon({
  major,
  className,
}: DoctorSpecialtyIconProps) {
  const icon = createElement(getSpecialtyIcon(major), {
    "aria-hidden": true,
    className: "h-[18px] w-[18px]",
    strokeWidth: 1.8,
  });

  return (
    <span
      role="img"
      title={major}
      aria-label={`تخصص ${major}`}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        "border border-primary/20 bg-primary/10 text-primary",
        className,
      )}
    >
      {icon}
    </span>
  );
}