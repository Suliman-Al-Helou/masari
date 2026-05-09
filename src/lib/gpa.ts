// src/lib/gpa.ts

export type GradeEntry = {
  grade: string | null;
  credits: number;
  status: string;
};

// جدول تحويل العلامات — يدعم الحروف والأرقام
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0,
  'F': 0.0,
};

function gradeToPoints(grade: string): number | null {
  const upper = grade.trim().toUpperCase();

  // حروف مباشرة
  if (upper in GRADE_POINTS) return GRADE_POINTS[upper];

  // رقمي (0-100) → تحويل لـ GPA
  const numeric = parseFloat(upper);
  if (!isNaN(numeric)) {
    if (numeric >= 93) return 4.0;
    if (numeric >= 90) return 3.7;
    if (numeric >= 87) return 3.3;
    if (numeric >= 83) return 3.0;
    if (numeric >= 80) return 2.7;
    if (numeric >= 77) return 2.3;
    if (numeric >= 73) return 2.0;
    if (numeric >= 70) return 1.7;
    if (numeric >= 67) return 1.3;
    if (numeric >= 60) return 1.0;
    return 0.0;
  }

  return null; // علامة غير معروفة
}

export function calculateGPA(courses: GradeEntry[]): {
  gpa: number | null;
  completedCredits: number;
  gradedCredits: number;
} {
  const completed = courses.filter(
    c => c.status === 'مكتملة' && c.grade
  );

  let totalPoints = 0;
  let gradedCredits = 0;

  for (const c of completed) {
    const points = gradeToPoints(c.grade!);
    if (points !== null) {
      totalPoints += points * c.credits;
      gradedCredits += c.credits;
    }
  }

  const completedCredits = courses
    .filter(c => c.status === 'مكتملة')
    .reduce((s, c) => s + c.credits, 0);

  return {
    gpa: gradedCredits > 0 ? Math.round((totalPoints / gradedCredits) * 100) / 100 : null,
    completedCredits,
    gradedCredits,
  };
}