import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getGreeting, formatDate } from '@/utils/formatters';
import { dashboardService } from '@/services/dashboardService';
import { Layout, X, Check, FileText } from 'lucide-react';

// Separate Dashboard Widgets
import QuickStats from '@/components/dashboard/QuickStats';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import RecentActivity from '@/components/dashboard/RecentActivity';
import GoalsTracker from '@/components/dashboard/GoalsTracker';
import QuoteCard from '@/components/dashboard/QuoteCard';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import LifeScoreGauge from '@/components/dashboard/LifeScoreGauge';
import LifeReportModal from '@/components/dashboard/LifeReportModal';
import HabitTrackerWidget from '@/components/dashboard/HabitTrackerWidget';

import SkeletonCard from '@/components/ui/SkeletonLoader';

// Animation variants for staggered card entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const DEFAULT_LAYOUT = {
  quickStats: true,
  quickActions: true,
  habits: true,
  charts: true,
  heatmap: true,
  tasks: true,
  calendar: true,
  activity: true,
  lifescore: true,
  goals: true,
  quote: true,
};

const WIDGET_NAMES = {
  quickStats: 'Quick Statistics',
  quickActions: 'Quick Actions Panel',
  habits: 'Daily Habit Streaks',
  charts: 'Analytical Charts',
  heatmap: 'GitHub Contribution Heatmap',
  tasks: 'Upcoming Assignments',
  calendar: 'Timetable Mini Calendar',
  activity: 'Recent Cross-Module Logs',
  lifescore: 'Dynamic Life Score Gauge',
  goals: 'Active Targets Tracker',
  quote: 'Motivational Daily Quotes',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('aetheria_dashboard_layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleToggleWidget = (key) => {
    const updated = { ...layout, [key]: !layout[key] };
    setLayout(updated);
    localStorage.setItem('aetheria_dashboard_layout', JSON.stringify(updated));
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.setItem('aetheria_dashboard_layout', JSON.stringify(DEFAULT_LAYOUT));
  };

  const today = formatDate(new Date(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-8 w-64 bg-bg-card rounded-md skeleton-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard count={4} />
        </div>
      </div>
    );
  }

  const firstName = summary?.userProfile?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User';

  return (
    <motion.div
      className="page-container relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dedicated Custom Background Photo for Dashboard */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url('/dashboard-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#020617]/60 to-[#020617]/80 backdrop-blur-[2px]" />
      </div>
      {/* Layout Customizer Panel */}
      <AnimatePresence>
        {showLayoutEditor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs z-40"
              onClick={() => setShowLayoutEditor(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-[320px] bg-gray-900 border-l border-gray-800 z-50 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-400" /> Customize Dashboard
                </h3>
                <button
                  onClick={() => setShowLayoutEditor(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Toggle the visibility of widgets on your dashboard workspace. Changes save instantly.
                </p>

                {Object.entries(layout).map(([key, isVisible]) => (
                  <button
                    key={key}
                    onClick={() => handleToggleWidget(key)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-950/40 hover:bg-gray-800/30 transition-colors"
                  >
                    <span className="text-xs font-semibold text-gray-300 text-left truncate pr-2">
                      {WIDGET_NAMES[key]}
                    </span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isVisible 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'border-gray-700 bg-transparent'
                    }`}>
                      {isVisible && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 mt-6">
                <button
                  onClick={handleResetLayout}
                  className="w-full py-2.5 text-xs font-bold text-center text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-xl transition-colors"
                >
                  Reset to Default Layout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Section 1: Greeting & Date */}
      <motion.div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="page-title text-2xl md:text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="page-subtitle text-sm text-text-muted mt-1">
            You have {summary?.upcomingTasks?.length || 0} pending tasks for today. Keep the streak alive!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2.5 rounded-lg bg-bg-card border border-border text-text-secondary hover:text-white hover:bg-bg-hover transition-all shadow-sm flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="Generate Life Report"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Life Report</span>
          </button>
          <button
            onClick={() => setShowLayoutEditor(true)}
            className="p-2.5 rounded-lg bg-bg-card border border-border text-text-secondary hover:text-white hover:bg-bg-hover transition-all shadow-sm flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="Edit Layout"
          >
            <Layout className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Edit Layout</span>
          </button>
          <div className="px-4 py-2 rounded-lg bg-bg-card border border-border text-xs sm:text-sm font-semibold text-text-secondary flex items-center justify-center shadow-sm">
            {today}
          </div>
        </div>
      </motion.div>

      {/* Section 2: Quick Stats Cards */}
      {layout.quickStats && (
        <motion.div variants={itemVariants}>
          <QuickStats stats={summary?.quickStats} />
        </motion.div>
      )}

      {/* Section 5: Quick Actions Modals & Grid */}
      {layout.quickActions && (
        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>
      )}

      {/* Section 6: Triple Charts */}
      {layout.charts && (
        <motion.div variants={itemVariants}>
          <DashboardCharts 
            expenseChartData={summary?.expenseChartData || []} 
            studyChartData={summary?.studyChartData || []} 
          />
        </motion.div>
      )}

      {/* Activity Heatmap */}
      {layout.heatmap && (
        <motion.div variants={itemVariants}>
          <ActivityHeatmap />
        </motion.div>
      )}

      {/* Rows for Tasks, Activities, Goals and Quote */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-4" variants={itemVariants}>
        {/* Left Column: Tasks + Mini Calendar + Habits */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {layout.habits && <HabitTrackerWidget />}
          {layout.tasks && <UpcomingTasks tasks={summary?.upcomingTasks} />}
          {layout.calendar && <MiniCalendar />}
        </div>

        {/* Middle Column: Recent Activity */}
        <div className="lg:col-span-4">
          {layout.activity && <RecentActivity activities={summary?.recentActivities} />}
        </div>

        {/* Right Column: Life Score + Goals + Quote */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {layout.lifescore && <LifeScoreGauge />}
          {layout.goals && <GoalsTracker />}
          {layout.quote && <QuoteCard />}
        </div>
      </motion.div>

      {/* Life Summary Report Modal */}
      <LifeReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </motion.div>
  );
};

export default DashboardPage;
