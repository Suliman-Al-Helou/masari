'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  getDashboardStats,
  getAcademicProgress,
  getCurrentCourses,
  getUrgentTasks,
  getTasks,
  updateTaskStatus,
} from '@/lib/api';

import { useAuth } from '@/lib/hooks/useAuth';


// =====================
// Types
// =====================
export interface DashboardStats {
  activeCourses: number;
  pendingTasks: number;
  daysToExam: number | null;
}

export interface AcademicProgress {
  percent: number;
  completedCredits: number;
  totalCredits: number;
}

export interface CurrentCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
}

export interface UrgentTask {
  id: string;
  title: string;
  course_code?: string;
  priority: string;
  status: string;
  due_date?: string;
  type?: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  type: string;
  course_code?: string;
  status: string;
  priority: string;
  due_date?: string;
}


// =====================
// Hook
// =====================
export function useDashboardData() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<AcademicProgress | null>(null);
  const [currentCourses, setCurrentCourses] = useState<CurrentCourse[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [statsData, progressData, coursesData, urgentData, allTasks] = await Promise.all([
        getDashboardStats(user.id),
        getAcademicProgress(user.id),
        getCurrentCourses(user.id),
        getUrgentTasks(user.id),
        getTasks(user.id),
      ]);

      setStats(statsData);
      setProgress(progressData);
      setCurrentCourses(coursesData);
      setUrgentTasks(urgentData);

      // المهام القادمة: أول 5 مهام غير مكتملة مرتبة بالتاريخ
      const upcoming = (allTasks ?? [])
        .filter(t => t.status !== 'مكتمل')
        .slice(0, 5);
      setUpcomingTasks(upcoming);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // دوال التفاعل مع المهام العاجلة
  const markTaskDone = async (id: string) => {
    try {
      await updateTaskStatus(id, { status: 'مكتمل' });
      setUrgentTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error marking task done:', err);
    }
  };

  const postponeTask = async (id: string) => {
    try {
      const task = urgentTasks.find(t => t.id === id);
      if (!task?.due_date) return;
      const newDate = new Date(task.due_date);
      newDate.setDate(newDate.getDate() + 2);
      const newDateStr = newDate.toISOString();
      await updateTaskStatus(id, { due_date: newDateStr });
      setUrgentTasks(prev =>
        prev.map(t => t.id === id ? { ...t, due_date: newDateStr } : t)
      );
    } catch (err) {
      console.error('Error postponing task:', err);
    }
  };

  return {
    stats,
    progress,
    currentCourses,
    urgentTasks,
    upcomingTasks,
    loading,
    error,
    refetch: fetchAll,
    markTaskDone,
    postponeTask,
  };
}