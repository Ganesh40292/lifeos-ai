import { useState, useEffect } from 'react';
import { Sparkles, HeartPulse, RefreshCw, AlertCircle, Droplet, Moon, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import { healthService } from '@/services/healthService';

const HealthInsightsPanel = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await healthService.getHealthInsights();
      if (res) {
        setInsights(res);
      }
    } catch (err) {
      console.error('Failed to load health insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getAdviceIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('sleep')) return <Moon className="w-4 h-4 text-indigo-400" />;
    if (lower.includes('water') || lower.includes('hydration')) return <Droplet className="w-4 h-4 text-blue-400" />;
    if (lower.includes('workout') || lower.includes('stretch') || lower.includes('physical')) return <HeartPulse className="w-4 h-4 text-rose-400" />;
    return <Sparkles className="w-4 h-4 text-amber-400" />;
  };

  return (
    <Card
      title="Wellness Insights"
      action={
        <button
          onClick={fetchInsights}
          className="p-1 rounded hover:bg-bg-hover text-text-faint hover:text-text transition-colors cursor-pointer"
          title="Refresh Insights"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-text-faint text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Cross-correlating workout and metric history...
          </div>
        ) : !insights || !insights.adviceList || insights.adviceList.length === 0 ? (
          <div className="text-center py-6 text-text-faint text-xs">
            Not enough data yet. Track your workouts and daily wellness metrics to unlock insights!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 border border-border/80 p-2.5 rounded-xl text-center">
              <div className="space-y-0.5">
                <span className="text-[9px] text-text-faint font-bold uppercase">Avg Sleep</span>
                <p className="text-sm font-bold text-text-secondary font-mono">{insights.averageSleep} hrs</p>
              </div>
              <div className="space-y-0.5 border-x border-border">
                <span className="text-[9px] text-text-faint font-bold uppercase">Avg Water</span>
                <p className="text-sm font-bold text-text-secondary font-mono">{insights.averageWater} gls</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-text-faint font-bold uppercase">Workouts</span>
                <p className="text-sm font-bold text-text-secondary font-mono">{insights.workoutCount} logged</p>
              </div>
            </div>

            {/* List of recommendations */}
            <div className="space-y-2">
              {insights.adviceList.map((advice, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 rounded-xl border border-border/80 bg-bg-elevated/20 hover:bg-bg-elevated/40 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getAdviceIcon(advice)}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HealthInsightsPanel;
