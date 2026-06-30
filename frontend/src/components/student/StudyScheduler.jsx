import { useState, useEffect } from 'react';
import { CalendarRange, Sparkles, BookOpen, Clock, ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import studentService from '@/services/studentService';

const StudyScheduler = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudySchedule();
      if (res.success) {
        setSchedule(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load study schedule recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const formatDateLabel = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    
    // Reset time for parity
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 2) return 'Day After Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <Card
      title="Algorithmic Study Schedule"
      action={
        <span className="flex items-center gap-1 text-[10px] bg-primary-muted/20 text-primary border border-primary/20 px-2 py-0.5 rounded-lg font-bold font-mono">
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> SMART PLANNER
        </span>
      }
    >
      <div className="space-y-4">
        <p className="text-[11px] text-text-muted leading-relaxed">
          Our scheduling engine distributes daily preparation blocks evenly across the days leading up to your assignment deadlines.
        </p>

        {loading ? (
          <div className="text-center py-6 text-text-faint text-xs">
            Calculating optimal study slots...
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-6 text-text-faint text-xs">
            No upcoming assignments require study blocks. Good job!
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((dayPlan) => (
              <div key={dayPlan.date} className="space-y-2 border-l-2 border-border-light pl-3 ml-1">
                <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-primary" />
                  {formatDateLabel(dayPlan.date)}
                </h4>
                
                <div className="space-y-1.5">
                  {dayPlan.blocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-bg-elevated/40 border border-border/80 hover:border-border transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text truncate">
                            {block.assignmentName}
                          </p>
                          <span className="text-[9px] font-bold text-warning-muted text-warning">
                            {block.message}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold font-mono">
                        <Clock className="w-3.5 h-3.5 text-text-faint" />
                        <span>{block.durationMinutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudyScheduler;
