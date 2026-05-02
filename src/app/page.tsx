import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickFeatures from '@/components/dashboard/QuickFeatures';
import ProgressCard from '@/components/dashboard/ProgressCard';
import CurrentCourses from '@/components/dashboard/CurrentCourses';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import QuickStats from '@/components/dashboard/QuickStats';
import UrgentTasksAlert from '@/components/dashboard/UrgentTasksAlert';
const mockUser = { full_name: 'Suliman Al Hellou' };

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <WelcomeCard user={mockUser} />
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