import { GraduationCap, CheckSquare, CreditCard, StickyNote, Award, Droplet, Clock } from 'lucide-react';
import StatCard from '@/components/charts/StatCard';

const QuickStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
      <StatCard
        title="Attendance"
        value={`${stats.attendancePercentage}%`}
        subtitle="Target: 75%"
        trend={stats.attendancePercentage >= 75 ? "up" : "down"}
        trendValue=""
        icon={<GraduationCap className="w-4 h-4" />}
        iconBg="bg-info-muted"
        iconColor="text-info"
      />
      <StatCard
        title="Today's Tasks"
        value={`${stats.tasksFinishedToday} / ${stats.totalTasksToday}`}
        subtitle={`${stats.tasksFinishedToday} finished today`}
        trend="up"
        trendValue=""
        icon={<CheckSquare className="w-4 h-4" />}
        iconBg="bg-danger-muted"
        iconColor="text-danger"
      />
      <StatCard
        title="Current CGPA"
        value={stats.currentCgpa > 0 ? stats.currentCgpa : 'N/A'}
        subtitle="Target: 9.0"
        trend="up"
        trendValue=""
        icon={<Award className="w-4 h-4" />}
        iconBg="bg-warning-muted"
        iconColor="text-warning"
      />
      <StatCard
        title="Study Hours"
        value="12.5h"
        subtitle="this week"
        trend="up"
        trendValue="+12%"
        icon={<Clock className="w-4 h-4" />}
        iconBg="bg-primary-muted"
        iconColor="text-primary"
      />
      <StatCard
        title="Monthly Expenses"
        value={`₹${stats.monthlyExpenses}`}
        subtitle="Current Month"
        trend={null}
        trendValue={null}
        icon={<CreditCard className="w-4 h-4" />}
        iconBg="bg-success-muted"
        iconColor="text-success"
      />
      <StatCard
        title="Notes Count"
        value={stats.notesCount}
        subtitle="Total written"
        trend="up"
        trendValue=""
        icon={<StickyNote className="w-4 h-4" />}
        iconBg="bg-accent-muted"
        iconColor="text-accent"
      />
      <StatCard
        title="Water Intake"
        value={`${stats.waterIntakeGlasses} Glasses`}
        subtitle="Today"
        trend={null}
        trendValue={null}
        icon={<Droplet className="w-4 h-4" />}
        iconBg="bg-info-muted"
        iconColor="text-info"
      />
    </div>
  );
};

export default QuickStats;
