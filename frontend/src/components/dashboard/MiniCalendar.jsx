import Card from '@/components/ui/Card';
import { Calendar } from 'lucide-react';
import clsx from 'clsx';

/**
 * Mini Calendar Card widget highlighting today's date and showing active task days.
 */
const MiniCalendar = () => {
  // Hardcoded for June 2026 (June 1st, 2026 is a Monday)
  const daysInMonth = 30;
  const startDayOffset = 1; // 1 means Monday (Sunday = 0, Monday = 1...)
  const todayDate = 26; // June 26th
  const monthName = 'June 2026';

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days with deadlines/events to show indicator dots
  const eventDays = [12, 15, 26, 27, 30];

  const blanks = Array(startDayOffset).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  return (
    <Card
      title="Academic Calendar"
      hover
      action={
        <span className="flex items-center gap-1 text-xs text-text-faint font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {monthName}
        </span>
      }
      className="h-full"
    >
      <div className="flex flex-col justify-between h-full">
        {/* Month Header */}
        <div className="text-center font-bold text-sm text-text-secondary mb-3">
          {monthName}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {/* Weekdays */}
          {weekdays.map((day) => (
            <div key={day} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {day}
            </div>
          ))}

          {/* Days Cells */}
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`blank-${idx}`} />;
            }

            const isToday = day === todayDate;
            const hasEvent = eventDays.includes(day);

            return (
              <div
                key={`day-${day}`}
                className="relative flex flex-col items-center justify-center py-1.5 cursor-pointer rounded-lg hover:bg-bg-hover transition-colors group"
              >
                <span
                  className={clsx(
                    'text-xs font-mono font-medium w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200',
                    isToday
                      ? 'bg-primary text-white font-bold ring-2 ring-primary-muted scale-110'
                      : 'text-text-secondary group-hover:text-text'
                  )}
                >
                  {day}
                </span>

                {/* Event Dot */}
                {hasEvent && !isToday && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />
                )}
                {hasEvent && isToday && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default MiniCalendar;
