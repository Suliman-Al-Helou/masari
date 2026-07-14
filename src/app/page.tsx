"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, isFuture } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile, getCourses, getTasks, getNotes } from "@/lib/api/api";
import { calculateGPA } from "@/lib/gpa";
import LandingPage from "@/components/landing/LandingPage";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import QuickFeatures from "@/components/dashboard/QuickFeatures";
import ProgressCard from "@/components/dashboard/ProgressCard";
import CurrentCourses from "@/components/dashboard/CurrentCourses";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import QuickStats from "@/components/dashboard/QuickStats";
import UrgentTasksAlert from "@/components/dashboard/UrgentTasksAlert";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import RecentNotes from "@/components/dashboard/RecentNotes";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  // ── جلب البيانات ──────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id).then(({ data }) => data),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", user?.id],
    queryFn: () => getCourses(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => getTasks(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  // ── آخر 3 ملاحظات ────────────────────────────────
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: () => getNotes(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.slice(0, 3),
  });

  // ── حسابات المواد ────────────────────────────────
  const courseStats = useMemo(() => {
    const completed = courses.filter((c) => c.status === "مكتملة");
    const inProgress = courses.filter((c) => c.status === "قيد الدراسة");
    const remaining = courses.filter(
      (c) => c.status === "متبقية" || c.status === "مخطط لها",
    );
    const completedCredits = completed.reduce(
      (s, c) => s + (c.credits ?? 0),
      0,
    );
    const remainingCredits = (profile?.total_credits ?? 0) - completedCredits;

    return {
      completedCount: completed.length,
      remainingCount: remaining.length,
      inProgressCount: inProgress.length,
      inProgressCourses: inProgress,
      completedCredits,
      remainingCredits,
      totalCredits: profile?.total_credits ?? 0,
    };
  }, [courses, profile?.total_credits]);

  // ── حسابات المعدل ────────────────────────────────
  const gpaStats = useMemo(() => {
    const { gpa: cumulativeGPA } = calculateGPA(
      courses.filter((c) => c.status === "مكتملة"),
    );
    const { gpa: semesterGPA } = calculateGPA(
      courses.filter((c) => c.status === "قيد الدراسة"),
    );
    return { cumulativeGPA, semesterGPA };
  }, [courses]);

  // ── حسابات المهام ────────────────────────────────
  const taskStats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending");

    const pendingAssignments = pending.filter(
      (t) => t.type === "واجب" || t.type === "مشروع",
    );

    const nextExam =
      pending
        .filter(
          (t) =>
            t.type === "امتحان" && t.due_date && isFuture(new Date(t.due_date)),
        )
        .sort(
          (a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
        )[0] ?? null;

    const daysToExam = nextExam?.due_date
      ? differenceInDays(new Date(nextExam.due_date), new Date())
      : null;

    const urgentTasks = pending.filter((t) => {
      if (!t.due_date) return false;
      const days = differenceInDays(new Date(t.due_date), new Date());
      return days >= 0 && days <= 2;
    });

    const upcomingTasks = pending
      .filter((t) => t.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
      )
      .slice(0, 5);

    return {
      pendingAssignmentsCount: pendingAssignments.length,
      pendingAssignments,
      nextExam,
      daysToExam,
      urgentTasks,
      upcomingTasks,
      pendingCount: pending.length,
    };
  }, [tasks]);

  // ── تقدم الفصل ───────────────────────────────────
  const progressPercent = useMemo(() => {
    const semesterTasks = tasks.filter(
      (t) => t.type === "واجب" || t.type === "مشروع" || t.type === "امتحان",
    );
    if (semesterTasks.length === 0) return 0;
    const done = semesterTasks.filter((t) => t.status === "done").length;
    return Math.round((done / semesterTasks.length) * 100);
  }, [tasks]);

  // ── حالة التحميل ─────────────────────────────────
  if (authLoading) return null;
  if (!user) return <LandingPage />;

  const loading = profileLoading || coursesLoading || tasksLoading;

  return (
    <div className=" mx-auto space-y-6">
      <WelcomeCard
        user={{
          full_name:
            profile?.full_name ?? user.user_metadata?.full_name ?? "مستخدم",
          major: profile?.major ?? undefined,
          semester: profile?.semester ?? undefined,
        }}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <UrgentTasksAlert urgentTasks={taskStats.urgentTasks} />

          <StatsGrid
            completedCredits={courseStats.completedCredits}
            remainingCredits={courseStats.remainingCredits}
            totalCredits={courseStats.totalCredits}
            completedCourses={courseStats.completedCount}
            remainingCourses={courseStats.remainingCount}
            cumulativeGPA={gpaStats.cumulativeGPA}
            semesterGPA={gpaStats.semesterGPA}
          />

          <QuickFeatures />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <QuickStats
                activeCourses={courseStats.inProgressCount}
                pendingTasks={taskStats.pendingAssignmentsCount}
                daysToExam={taskStats.daysToExam}
              />
              <ProgressCard
                percent={progressPercent}
                completedCredits={courseStats.completedCredits}
                totalCredits={courseStats.totalCredits}
              />
              <CurrentCourses courses={courseStats.inProgressCourses} />
            </div>

            <div className="space-y-6">
              <UpcomingTasks tasks={taskStats.upcomingTasks} />
              <RecentNotes notes={notes} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
