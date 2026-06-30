import Card from '@/components/ui/Card';
import { Target, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const initialGoals = [
  { id: 1, title: 'React Learning', current: 90, target: 100, unit: '%', color: 'bg-accent' },
  { id: 2, title: 'Spring Boot Learning', current: 60, target: 100, unit: '%', color: 'bg-primary' },
  { id: 3, title: 'DSA Practice', current: 45, target: 100, unit: '%', color: 'bg-danger' },
  { id: 4, title: 'Placement Preparation', current: 75, target: 100, unit: '%', color: 'bg-info' },
  { id: 5, title: 'Weight Goal', current: 74, target: 70, unit: ' kg', color: 'bg-success', inverse: true },
];

/**
 * Goals with custom progress bars dashboard widget.
 */
const GoalsTracker = () => {
  return (
    <Card
      title="Goals"
      hover
      action={
        <span className="flex items-center gap-1 text-xs text-text-faint font-medium">
          <Target className="w-3.5 h-3.5 text-primary" />
          5 active
        </span>
      }
      className="h-full"
    >
      <div className="space-y-3.5">
        {initialGoals.map((goal) => {
          let progressPercent = 0;
          if (goal.inverse) {
            const baseline = 80;
            const totalDiff = baseline - goal.target;
            const currentDiff = baseline - goal.current;
            progressPercent = Math.max(0, Math.min(100, Math.round((currentDiff / totalDiff) * 100)));
          } else {
            progressPercent = Math.round((goal.current / goal.target) * 100);
          }

          return (
            <div key={goal.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary group-hover:text-text transition-colors">
                  {goal.title}
                </span>
                <span className="text-text-muted font-mono font-medium">
                  {goal.current}
                  {goal.unit}
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', goal.color)}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Small details */}
              <div className="flex items-center justify-between text-[10px] text-text-faint">
                <span>{progressPercent}% Complete</span>
                {progressPercent >= 90 && (
                  <span className="flex items-center gap-0.5 text-accent font-medium animate-[pulse-soft_2s_infinite]">
                    <Sparkles className="w-2.5 h-2.5" /> Almost there!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default GoalsTracker;
