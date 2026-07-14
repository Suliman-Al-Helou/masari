

// ─── مجموعات التخصصات ────────────────────────────────────
export const MAJOR_GROUPS: { label: string; majors: string[] }[] = [
  { label: 'تقنية المعلومات', majors: ['علم الحاسب', 'هندسة البرمجيات', 'هندسة الحاسوب', 'نظم المعلومات', 'الذكاء الاصطناعي'] },
  { label: 'الطب والصحة',     majors: ['الطب', 'الصيدلة', 'التمريض'] },
  { label: 'الهندسة',         majors: ['الهندسة المدنية', 'الهندسة الكهربائية', 'الهندسة الميكانيكية'] },
  { label: 'الأعمال والاقتصاد', majors: ['إدارة الأعمال', 'المحاسبة', 'التسويق', 'الاقتصاد'] },
  { label: 'العلوم الإنسانية', majors: ['علم النفس', 'الحقوق', 'الإعلام'] },
]

/** يُرجع مجموعة التخصص لأي تخصص */
export function getMajorGroup(major: string | null) {
  if (!major) return null
  return MAJOR_GROUPS.find(g => g.majors.includes(major)) ?? null
}