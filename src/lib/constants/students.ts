

export interface Student {
  id: string;
  full_name: string;
  major: string | null;
  university: string | null;
  semester: string | null;
  show_in_network?: boolean;
  email?: string;
  role?: 'admin' | 'user';
  year?: number;
}

export function getInitials(name: string): string {
  if (!name) return '؟';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

// مجموعات التخصصات
export const MAJOR_GROUPS: { label: string; majors: string[] }[] = [
  {
    label: 'تقنية المعلومات',
    majors: ['علم الحاسب', 'هندسة البرمجيات', 'هندسة الحاسوب', 'نظم المعلومات', 'الذكاء الاصطناعي'],
  },
  {
    label: 'الطب والصحة',
    majors: ['الطب', 'الصيدلة', 'التمريض'],
  },
  {
    label: 'الهندسة',
    majors: ['الهندسة المدنية', 'الهندسة الكهربائية', 'الهندسة الميكانيكية'],
  },
  {
    label: 'الأعمال والاقتصاد',
    majors: ['إدارة الأعمال', 'المحاسبة', 'التسويق', 'الاقتصاد'],
  },
  {
    label: 'العلوم الإنسانية',
    majors: ['علم النفس', 'الحقوق', 'الإعلام'],
  },
];

/** يُرجع فئة التخصص (الـ group) الخاصة بأي تخصص */
export function getMajorGroup(major: string | null): { label: string; majors: string[] } | null {
  if (!major) return null;
  return MAJOR_GROUPS.find(g => g.majors.includes(major)) ?? null;
}