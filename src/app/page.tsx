'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import LandingPage from '@/components/landing/LandingPage';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickFeatures from '@/components/dashboard/QuickFeatures';
import ProgressCard from '@/components/dashboard/ProgressCard';
import CurrentCourses from '@/components/dashboard/CurrentCourses';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import QuickStats from '@/components/dashboard/QuickStats';
import UrgentTasksAlert from '@/components/dashboard/UrgentTasksAlert';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return null; // AuthGuard بيتكفل بالـ spinner

  // مش مسجّل — Landing Page
  if (!user) return <LandingPage />;

  // مسجّل — Dashboard
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <WelcomeCard user={{ full_name: user.user_metadata?.full_name || 'مستخدم' }} />
      <UrgentTasksAlert />
      <StatsGrid />
      <QuickFeatures />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <QuickStats />
          <ProgressCard />
          <CurrentCourses />
        </div>
        <div className="space-y-6">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}