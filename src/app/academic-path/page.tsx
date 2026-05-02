'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import AcademicProgress from '@/components/academic-path/AcademicProgress';
import AcademicFilters from '@/components/academic-path/AcademicFilters';
import CourseCard from '@/components/academic-path/CourseCard';
import AddCourseDialog from '@/components/academic-path/AddCourseDialog';
import { getCourses, addCourse } from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';

type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

export default function AcademicPathPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // جلب البيانات من Supabase
  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses(user.id);
        setCourses(data ?? []);
      } catch (error) {
        console.error('خطأ في جلب المواد:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // إضافة مادة جديدة
  const handleAdd = async (course: Omit<Course, 'id' | 'grade'>) => {
    if (!user) return;
    try {
      const newCourse = await addCourse({ ...course, user_id: user.id });
      setCourses(prev => [newCourse, ...prev]);
    } catch (error) {
      console.error('خطأ في إضافة المادة:', error);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.name.includes(search) || c.code.includes(search);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المسار الدراسي</h1>
          <p className="text-sm text-muted-foreground mt-1">تتبع تقدمك الأكاديمي والمواد المطلوبة</p>
        </div>
        <AddCourseDialog onAdd={handleAdd} />
      </div>

      <AcademicProgress courses={courses} />
      <AcademicFilters
        search={search}
        filterStatus={filterStatus}
        onSearch={setSearch}
        onFilter={setFilterStatus}
      />

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد مواد، ابدأ بإضافة موادك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

    </div>
  );
}