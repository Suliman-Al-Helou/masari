'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getNetworkStudents,
  inviteStudent,
  getUnreadCount,
  getProfile,
} from '@/lib/api/api';
import { Student } from '@/types';
import StudentsHeader  from '@/components/students/StudentsHeader';
import StudentsSearch  from '@/components/students/StudentsSearch';
import StudentsGrid    from '@/components/students/StudentsGrid';
import MajorFilter     from '@/components/students/MajorFilter';
import InviteDialog    from '@/components/students/InviteDialog';
import ChatPanel       from '@/components/students/ChatPanel';

export default function StudentsPage() {
  const { user } = useAuth();

  // ── UI State فقط ──
  const [search,       setSearch]       = useState('');
  const [majorFilter,  setMajorFilter]  = useState<string | null>(null);
  const [activeStudent,setActiveStudent]= useState<Student | null>(null);
  const [inviteOpen,   setInviteOpen]   = useState(false);

  // ── جلب ملف المستخدم (جامعة + تخصص) ──
  const { data: myProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn:  () => getProfile(user!.id).then(({ data }) => data),
    enabled:  !!user,
    staleTime: 1000 * 60 * 5,
    // عند أول تحميل — عيّن الفلتر للتخصص تلقائياً
    select: (data) => {
      if (data?.major && majorFilter === null) {
        // نستخدم setTimeout لتجنب setState أثناء الـ render
        setTimeout(() => setMajorFilter(data.major), 0);
      }
      return data;
    },
  });

  const myMajor      = myProfile?.major      ?? null;
  const myUniversity = myProfile?.university ?? null;

  // ── جلب الطلاب — يعتمد على اكتمال تحميل الجامعة ──
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students', user?.id, { major: majorFilter, search, university: myUniversity }],
    queryFn:  () => getNetworkStudents(user!.id, {
      major:      majorFilter    ?? undefined,
      search:     search.trim()  || undefined,
      university: myUniversity   ?? undefined,
    }),
    enabled:   !!user && !!myUniversity,   // انتظر الجامعة
    staleTime: 1000 * 30, 
  });

  // ── عدد الرسائل غير المقروءة — refetch كل 30 ث ──
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['unread', user?.id],
    queryFn:  () => getUnreadCount(user!.id),
    enabled:  !!user,
    refetchInterval: 30_000,   // بدل setInterval اليدوي
    staleTime: 0,
  });

  // ── عدد الطلاب في نفس التخصص ──
  const totalInMajor = useMemo(
    () => (myMajor ? (students as Student[]).filter((s) => s.major === myMajor).length : 0),
    [students, myMajor],
  );

  // ── Handlers ──
  const handleChat = (student: Student) => setActiveStudent(student);
  const handleCloseChat = () => setActiveStudent(null);
  const handleInvite = async (email: string) => {
    if (!user) return null;
    return await inviteStudent(user.id, email);
  };

  // ── Mobile: شاشة شات كاملة ──
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );

  if (isMobile && activeStudent) {
    return <ChatPanel student={activeStudent} onClose={handleCloseChat} isMobile />;
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden -m-4 lg:-m-8">

      {/* ── قائمة الطلاب ── */}
      <div className={`flex flex-col transition-all duration-300 overflow-y-auto
        ${activeStudent && !isMobile ? 'w-[52%] border-l border-border' : 'w-full'}
      `}>
        <div className="p-4 lg:p-8 space-y-5">
          <StudentsHeader
            count={students.length}
            totalInMajor={totalInMajor}
            currentMajor={myMajor}
            onInviteClick={() => setInviteOpen(true)}
          />
          <StudentsSearch value={search} onChange={setSearch} />
          <MajorFilter
            selected={majorFilter}
            onChange={setMajorFilter}
            currentMajor={myMajor}
          />
          <StudentsGrid
            students={students as Student[]}
            loading={studentsLoading}
            onChat={handleChat}
            unreadCounts={unreadCounts}
            activeStudentId={activeStudent?.id}
          />
        </div>
      </div>

      {/* ── Chat Panel (Desktop) ── */}
      {activeStudent && !isMobile && (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <ChatPanel student={activeStudent} onClose={handleCloseChat} isMobile={false} />
        </div>
      )}

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </div>
  );
}
