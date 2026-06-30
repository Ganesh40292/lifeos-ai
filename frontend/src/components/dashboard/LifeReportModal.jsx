import { useState, useEffect } from 'react';
import { FileText, Trophy, ArrowRight, Printer, RefreshCw, Award, HeartPulse, GraduationCap, Wallet, StickyNote } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { dashboardService } from '@/services/dashboardService';
import { exportUtils } from '@/utils/exportUtils';

const LifeReportModal = ({ isOpen, onClose }) => {
  const [period, setPeriod] = useState('WEEK');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getLifeReport(period);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, period]);

  const handlePrint = () => {
    exportUtils.printToPDF('lifeos-printed-report', `LifeOS-${period}-Report`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Life Report Generator" size="md">
      <div className="space-y-6 py-2">
        {/* Toggle Period Tab */}
        <div className="flex bg-bg rounded-xl p-1 border border-border max-w-[240px]">
          <button
            onClick={() => setPeriod('WEEK')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'WEEK'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Weekly Summary
          </button>
          <button
            onClick={() => setPeriod('MONTH')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'MONTH'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Monthly Summary
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-text-muted">Analyzing database records...</span>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* The printable card design */}
            <div
              id="lifeos-printed-report"
              className="bg-bg-card border border-border p-6 rounded-2xl relative overflow-hidden shadow-lg space-y-6"
            >
              {/* Decorative side accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-warning" />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> LifeOS Productivity Report
                  </h3>
                  <p className="text-xs text-text-faint font-medium font-mono">{report.dateRange}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-primary-muted/20 text-primary border border-primary/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    {report.period}
                  </span>
                  <p className="text-[9px] text-text-faint mt-1">Generated: {report.generatedAt}</p>
                </div>
              </div>

              {/* Grid of aggregated stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-elevated border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>Tasks Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{report.tasksCompleted}</p>
                  <p className="text-[10px] text-text-faint">Assignments & Sprints</p>
                </div>

                <div className="p-4 bg-bg-elevated border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Total Spending</span>
                  </div>
                  <p className="text-2xl font-bold text-text">₹{report.totalExpenses.toLocaleString()}</p>
                  <p className="text-[10px] text-text-faint">Logged transaction costs</p>
                </div>

                <div className="p-4 bg-bg-elevated border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>Workouts Logged</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{report.workoutsLogged}</p>
                  <p className="text-[10px] text-text-faint">Fitness sessions</p>
                </div>

                <div className="p-4 bg-bg-elevated border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                    <StickyNote className="w-4 h-4 text-amber-400" />
                    <span>Notes Created</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{report.notesCreated}</p>
                  <p className="text-[10px] text-text-faint">Thoughts & archives</p>
                </div>
              </div>

              {/* Total XP Progress Bar Box */}
              <div className="p-4 bg-primary-muted/10 border border-primary/20 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Estimated XP Accumulated</span>
                  <p className="text-xl font-bold text-text">+{report.xpEarned} XP</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Trophy className="w-6 h-6 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Print Action button */}
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Dismiss
              </Button>
              <Button variant="accent" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Export PDF Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-faint text-xs">Failed to generate report card.</div>
        )}
      </div>
    </Modal>
  );
};

export default LifeReportModal;
