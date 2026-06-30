import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Calendar, Check } from 'lucide-react';

const UpcomingTasks = ({ tasks }) => {
  if (!tasks) return null;

  const pendingCount = tasks.length;

  return (
    <Card
      title="Upcoming Tasks"
      hover
      action={
        <Badge variant={pendingCount > 0 ? 'warning' : 'success'} size="sm">
          {pendingCount} pending
        </Badge>
      }
      className="h-full"
    >
      <div className="space-y-2">
        {tasks.length > 0 ? tasks.map((task) => (
          <motion.div
            layout
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer group"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {/* Custom Interactive Checkbox */}
            <div className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 border-border-light group-hover:border-text-muted">
            </div>

            {/* Task label */}
            <span className="text-sm flex-1 truncate transition-all duration-200 text-text-secondary group-hover:text-text">
              {task.title}
            </span>

            {/* Meta: Due Date & Course Code Badge */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-text-faint">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
              <Badge variant="primary" size="sm" dot>
                {task.courseCode}
              </Badge>
            </div>
          </motion.div>
        )) : (
          <div className="text-sm text-text-faint py-4 text-center">No upcoming tasks! 🎉</div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingTasks;
