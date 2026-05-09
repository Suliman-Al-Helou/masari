// src/lib/exportTranscript.ts
// يستخدم jsPDF — ثبّتها: npm install jspdf

import { calculateGPA } from './gpa';

type Course = {
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

type Profile = {
  full_name?: string;
  university?: string;
  major?: string;
};

export async function exportTranscriptPDF(courses: Course[], profile: Profile) {
  // dynamic import عشان jsPDF مكتبة ضخمة
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const { gpa, completedCredits } = calculateGPA(courses);
  const completed = courses.filter(c => c.status === 'مكتملة');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // ── الخط والاتجاه ──
  // jsPDF لا يدعم العربية مباشرة — نستخدم الإنجليزي للـ labels
  // والعربي يُكتب بـ text مع تحديد الموضع
  doc.setFont('helvetica');

  // ── Header ──
  doc.setFillColor(37, 99, 235); // primary blue
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Academic Transcript', pageW / 2, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.text('السجل الأكاديمي — مساري', pageW / 2, 28, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('ar-EG')}`, pageW / 2, 36, { align: 'center' });

  y = 52;

  // ── Student Info ──
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 7;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const infoRows = [
    ['Name', profile.full_name || '—'],
    ['University', profile.university || '—'],
    ['Major', profile.major || '—'],
    ['Completed Credits', `${completedCredits} hrs`],
    ['GPA', gpa !== null ? `${gpa.toFixed(2)} / 4.00` : 'N/A'],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 45, y);
    y += 7;
  }

  y += 4;

  // ── Courses Table ──
  doc.setFont('helvetica', 'bold');
  doc.text('Completed Courses', margin, y);
  y += 7;
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  // Table header
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 2, y);
  doc.text('Course Name', margin + 12, y);
  doc.text('Code', margin + 90, y);
  doc.text('Credits', margin + 115, y);
  doc.text('Grade', margin + 138, y);
  doc.text('GPA Pts', margin + 155, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const GRADE_POINTS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0,
  };

  completed.forEach((course, i) => {
    if (y > 270) { doc.addPage(); y = 20; }

    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
    }

    const pts = course.grade
      ? (GRADE_POINTS[course.grade.toUpperCase()] ?? '—')
      : '—';

    doc.setTextColor(30, 30, 30);
    doc.text(String(i + 1), margin + 2, y);
    doc.text(course.name.slice(0, 30), margin + 12, y);
    doc.text(course.code, margin + 90, y);
    doc.text(String(course.credits), margin + 118, y);
    doc.text(course.grade ?? '—', margin + 140, y);
    doc.text(String(pts), margin + 158, y);
    y += 7;
  });

  // ── Footer GPA Summary ──
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`Cumulative GPA: ${gpa !== null ? gpa.toFixed(2) : 'N/A'} / 4.00`, margin, y);

  // ── Save ──
  const filename = `transcript_${profile.full_name?.replace(/\s+/g, '_') || 'student'}_${Date.now()}.pdf`;
  doc.save(filename);
}