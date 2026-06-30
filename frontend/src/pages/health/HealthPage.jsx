import { useState, useEffect, useCallback } from 'react';
import { HeartPulse, Activity, Download, Printer } from 'lucide-react';
import { healthService } from '@/services/healthService';
import { useAuth } from '@/hooks/useAuth';
import { exportUtils } from '@/utils/exportUtils';
import Button from '@/components/ui/Button';
import MetricsPanel from './MetricsPanel';
import WorkoutLog from './WorkoutLog';
import HealthCharts from './HealthCharts';
import HealthInsightsPanel from '@/components/health/HealthInsightsPanel';

const HealthPage = () => {
  const { refreshUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [workoutsData, metricsData] = await Promise.all([
        healthService.getWorkouts(),
        healthService.getMetrics()
      ]);
      setWorkouts(workoutsData);
      setMetrics(metricsData);
      refreshUser();
    } catch (err) {
      console.error('Failed to load health data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const handleExportCSV = () => {
    if (!workouts || workouts.length === 0) return;
    exportUtils.downloadCSV(
      workouts,
      ['Type', 'Duration (min)', 'Calories', 'Date', 'Notes'],
      ['type', 'durationMinutes', 'caloriesBurned', 'date', 'notes'],
      'workouts.csv'
    );
  };

  const handleExportPDF = () => {
    exportUtils.printToPDF('health-page-content', 'Health & Fitness Report');
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-100 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      <div id="health-page-content" className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center tracking-tight">
              <HeartPulse className="w-8 h-8 mr-3 text-red-500" />
              Health & Fitness
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Track your daily metrics and workout routines
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4.5 h-4.5" />}
              onClick={handleExportCSV}
              title="Export CSV"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4.5 h-4.5" />}
              onClick={handleExportPDF}
              title="Export PDF"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Daily Logging Panel */}
        <MetricsPanel metrics={metrics} onRefresh={fetchData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Area */}
          <div className="lg:col-span-2 space-y-6">
            <HealthCharts metrics={metrics} />
          </div>

          {/* Workouts & Insights Area */}
          <div className="lg:col-span-1 space-y-6">
            <HealthInsightsPanel />
            <WorkoutLog workouts={workouts} onRefresh={fetchData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthPage;
