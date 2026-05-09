'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getNetworkStudents, inviteStudent, getUnreadCount, getProfile } from '@/lib/api';
import { Student } from '@/lib/constants/students';
import StudentsHeader from '@/components/students/StudentsHeader';
import StudentsSearch from '@/components/students/StudentsSearch';
import StudentsGrid from '@/components/students/StudentsGrid';
import MajorFilter from '@/components/students/MajorFilter';
import InviteDialog from '@/components/students/InviteDialog';
import ChatPanel from '@/components/students/ChatPanel';


export default function StudentsPage() {
  const { user } = useAuth();

  // ── بيانات المستخدم الحالي ──
  const [myMajor, setMyMajor] = useState<string | null>(null);

  // ── الطلاب ──
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState<string | null>(null);

  // ── Chat ──
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // ── Invite ──
  const [inviteOpen, setInviteOpen] = useState(false);

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
const [myUniversity, setMyUniversity] = useState<string | null>(null);
  // جلب ملف المستخدم لمعرفة تخصصه
useEffect(() => {
  if (!user) return;
  getProfile(user.id).then(({ data }) => {
    if (data?.major) {
      setMyMajor(data.major);
      setMajorFilter(data.major);
    }
    if (data?.university) setMyUniversity(data.university);
  });
}, [user]);

  // جلب الطلاب من Supabase
const fetchStudents = useCallback(async () => {
  if (!user) return;
  if (!myUniversity) return; // ✅ انتظر حتى تتحمل الجامعة
  setLoading(true);
  try {
    const data = await getNetworkStudents(user.id, {
      major: majorFilter ?? undefined,
      university: myUniversity ?? undefined,
      search: search || undefined,
    });
    setStudents(data as Student[]);
  } catch {
    setStudents([]);
  } finally {
    setLoading(false);
  }
}, [user, majorFilter, myUniversity, search]);
  useEffect(() => {
    const timer = setTimeout(fetchStudents, search ? 400 : 0); // debounce للبحث
    return () => clearTimeout(timer);
  }, [fetchStudents, search]);

  // عدد الرسائل غير المقروءة
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const counts = await getUnreadCount(user.id);
      setUnreadCounts(counts);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // عدد الطلاب في نفس التخصص
  const totalInMajor = useMemo(() =>
    myMajor ? students.filter(s => s.major === myMajor).length : 0,
    [students, myMajor]
  );

  const handleChat = (student: Student) => {
    setActiveStudent(student);
    setUnreadCounts(prev => ({ ...prev, [student.id]: 0 }));
  };

  const handleCloseChat = () => setActiveStudent(null);

  const handleInvite = async (email: string) => {
    if (!user) return null;
    return await inviteStudent(user.id, email);
  };

  // Mobile: شاشة شات كاملة
  if (isMobile && activeStudent) {
    return (
      <ChatPanel
        student={activeStudent}
        onClose={handleCloseChat}
        isMobile
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden -m-4 lg:-m-8">

      {/* ── قائمة الطلاب ── */}
      <div className={`flex flex-col transition-all duration-300 overflow-y-auto ${
        activeStudent && !isMobile ? 'w-[52%] border-l border-border' : 'w-full'
      }`}>
        <div className="p-4 lg:p-8 space-y-5">

          <StudentsHeader
            count={students.length}
            totalInMajor={totalInMajor}
            currentMajor={myMajor}
            onInviteClick={() => setInviteOpen(true)}
          />

          <StudentsSearch value={search} onChange={setSearch} />

          {/* فلتر التخصصات */}
          <MajorFilter
            selected={majorFilter}
            onChange={setMajorFilter}
            currentMajor={myMajor}
          />

          <StudentsGrid
            students={students}
            loading={loading}
            onChat={handleChat}
            unreadCounts={unreadCounts}
            activeStudentId={activeStudent?.id}
          />
        </div>
      </div>

      {/* ── Chat Panel (Desktop only) ── */}
      {activeStudent && !isMobile && (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <ChatPanel
            student={activeStudent}
            onClose={handleCloseChat}
            isMobile={false}
          />
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
