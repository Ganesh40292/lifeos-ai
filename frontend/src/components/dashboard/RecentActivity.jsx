import { FileText, GraduationCap, DollarSign, Activity, Briefcase, Info } from 'lucide-react';
import Card from '@/components/ui/Card';

const getIconForType = (type) => {
  switch (type) {
    case 'note': return { icon: FileText, color: 'text-accent', bgColor: 'bg-accent-muted' };
    case 'finance': return { icon: DollarSign, color: 'text-success', bgColor: 'bg-success-muted' };
    case 'student': return { icon: GraduationCap, color: 'text-primary', bgColor: 'bg-primary-muted' };
    case 'health': return { icon: Activity, color: 'text-info', bgColor: 'bg-info-muted' };
    case 'career': return { icon: Briefcase, color: 'text-warning', bgColor: 'bg-warning-muted' };
    default: return { icon: Info, color: 'text-gray-400', bgColor: 'bg-gray-800' };
  }
};

const RecentActivity = ({ activities }) => {
  if (!activities) return null;

  return (
    <Card title="Recent Activity" hover className="h-full">
      <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
        {activities.length > 0 ? activities.map((act) => {
          const { icon: Icon, color, bgColor } = getIconForType(act.type);
          return (
            <div key={act.id} className="relative flex items-start justify-between gap-4 group">
              {/* Timeline Bullet Icon */}
              <div className={`absolute left-[-25px] top-0.5 p-1.5 rounded-full ${bgColor} ${color} ring-4 ring-bg-card flex items-center justify-center z-10 transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="w-3 h-3" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
                  {act.title}
                </h4>
                <p className="text-sm text-text-secondary mt-0.5 group-hover:text-text transition-colors">
                  {act.description}
                </p>
              </div>

              {/* Time stamp */}
              <span className="text-xs text-text-faint whitespace-nowrap self-start mt-0.5">
                {act.timeAgo}
              </span>
            </div>
          );
        }) : (
          <div className="text-sm text-text-faint py-4 text-center">No recent activity</div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
