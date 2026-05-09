'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useDashboard } from '@/lib/hooks/useDashboard';
import LandingPage from '@/components/landing/LandingPage';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickFeatures from '@/components/dashboard/QuickFeatures';
import ProgressCard from '@/components/dashboard/ProgressCard';
import CurrentCourses from '@/components/dashboard/CurrentCourses';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import QuickStats from '@/components/dashboard/QuickStats';
import UrgentTasksAlert from '@/components/dashboard/UrgentTasksAlert';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dashLoading } = useDashboard();

  if (authLoading) return null;
  if (!user) return <LandingPage />;

  const loading = dashLoading && !data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <WelcomeCard user={{ full_name: user.user_metadata?.full_name || 'مستخدم' }} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <UrgentTasksAlert urgentTasks={data?.urgentTasks ?? []} />
          <StatsGrid
            completedCredits={data?.completedCredits ?? 0}
            completedCourses={data?.completedCourses ?? 0}
          />
          <QuickFeatures />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <QuickStats
                activeCourses={data?.activeCourses?.length ?? 0}
                pendingTasks={data?.pendingTasksCount ?? 0}
                daysToExam={data?.daysToExam ?? null}
              />
              <ProgressCard
                percent={data?.progressPercent ?? 0}
                completedCredits={data?.completedCredits ?? 0}
                totalCredits={data?.totalCredits ?? 0}
              />
              <CurrentCourses courses={data?.activeCourses ?? []} />
            </div>
            <div className="space-y-6">
              <UpcomingTasks tasks={data?.upcomingTasks ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}