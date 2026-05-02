'use client';

// src/app/students/page.tsx

import { useState, useMemo } from 'react';
import { MOCK_STUDENTS, Student } from '@/lib/constants/students';
import StudentsHeader from '@/components/students/StudentsHeader';
import StudentsSearch from '@/components/students/StudentsSearch';
import StudentsGrid from '@/components/students/StudentsGrid';
import InviteDialog from '@/components/students/InviteDialog';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [loading] = useState(false); // ← غيّره لـ true واستبدل MOCK_STUDENTS بـ API call عند الربط

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.full_name?.includes(search) || s.email?.includes(search)
    ),
    [students, search]
  );

  const handleInvite = (email: string) => {
    // TODO: استبدل بـ API call حقيقي عند ربط الـ backend
    console.log('Inviting:', email);
    setInviteOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <StudentsHeader
        count={filteredStudents.length}
        onInviteClick={() => setInviteOpen(true)}
      />

      <StudentsSearch value={search} onChange={setSearch} />

      <StudentsGrid students={filteredStudents} loading={loading} />

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </div>
  );
}