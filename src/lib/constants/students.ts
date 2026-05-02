// src/lib/constants/students.ts

export interface Student {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  major?: string;
  year?: number;
}

// بيانات وهمية مؤقتة حتى ربط الـ API
export const MOCK_STUDENTS: Student[] = [
  { id: '1', full_name: 'سليمان الأحمد', email: 'suliman@university.edu', role: 'admin', major: 'علوم الحاسوب', year: 3 },
  { id: '2', full_name: 'نورة المطيري', email: 'noura@university.edu', role: 'user', major: 'هندسة البرمجيات', year: 2 },
  { id: '3', full_name: 'فيصل العمري', email: 'faisal@university.edu', role: 'user', major: 'نظم المعلومات', year: 4 },
  { id: '4', full_name: 'ريم الزهراني', email: 'reem@university.edu', role: 'user', major: 'علوم الحاسوب', year: 1 },
  { id: '5', full_name: 'عبدالله القحطاني', email: 'abdulla@university.edu', role: 'user', major: 'هندسة البرمجيات', year: 3 },
  { id: '6', full_name: 'سارة الدوسري', email: 'sara@university.edu', role: 'user', major: 'الذكاء الاصطناعي', year: 2 },
];

export function getInitials(name: string): string {
  if (!name) return '؟';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);
}