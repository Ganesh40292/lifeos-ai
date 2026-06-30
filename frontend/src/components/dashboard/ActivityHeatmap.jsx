import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { dashboardService } from '@/services/dashboardService';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColor = (count) => {
  if (count === 0) return 'bg-gray-800/60';
  if (count <= 1) return 'bg-emerald-900/70';
  if (count <= 3) return 'bg-emerald-700/80';
  if (count <= 5) return 'bg-emerald-500';
  return 'bg-emerald-400';
};

const getColorHex = (count) => {
  if (count === 0) return '#1a1a2e';
  if (count <= 1) return '#064e3b';
  if (count <= 3) return '#047857';
  if (count <= 5) return '#10b981';
  return '#34d399';
};

const ActivityHeatmap = () => {
  const [data, setData] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await dashboardService.getActivityHeatmap();
        setData(result);
      } catch (err) {
        // Generate empty 365-day fallback
        const days = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          days.push({ date: d.toISOString().split('T')[0], count: 0 });
        }
        setData(days);
      }
    };
    fetch();
  }, []);

  // Group into weeks (columns) for the grid
  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) return { weeks: [], monthLabels: [] };

    const weeks = [];
    let currentWeek = [];
    const labels = [];
    let lastMonth = -1;

    // Pad first week with empty days
    const firstDay = new Date(data[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    data.forEach((entry, idx) => {
      const date = new Date(entry.date);
      const month = date.getMonth();
      
      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], weekIndex: weeks.length + (currentWeek.length > 0 ? 1 : 0) });
        lastMonth = month;
      }

      currentWeek.push(entry);
      if (date.getDay() === 6 || idx === data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return { weeks, monthLabels: labels };
  }, [data]);

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  // Compute consecutive active day streak walking back from today
  const activeStreak = useMemo(() => {
    if (data.length === 0) return 0;
    let streak = 0;
    // data is ordered chronological: 364 days ago to today (data.length - 1)
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].count > 0) {
        streak++;
      } else {
        // Allow streak to count if today is 0 but yesterday was active
        if (i === data.length - 1) continue;
        break;
      }
    }
    return streak;
  }, [data]);

  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <span>Daily Focus & Activity Heatmap</span>
          {activeStreak > 0 && (
            <span className="text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm shadow-orange-500/20 animate-pulse">
              🔥 {activeStreak} Day Streak
            </span>
          )}
        </div>
      }
      hover 
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          <span className="text-white font-semibold">{totalContributions}</span> activities logged in the last 365 days
        </p>
        {/* Legend */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          Less
          {[0, 1, 3, 5, 7].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColorHex(level) }}
            />
          ))}
          More
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[720px]">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-500 absolute"
                style={{ left: `${(label.weekIndex / weeks.length) * 100}%` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px] mt-4">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-1 pt-0">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[13px] text-[10px] text-gray-500 flex items-center justify-end w-6">
                  {day}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) => (
                  <motion.div
                    key={dIdx}
                    className={`w-[13px] h-[13px] rounded-sm cursor-pointer transition-all ${
                      day ? getColor(day.count) : 'bg-transparent'
                    }`}
                    whileHover={{ scale: 1.4 }}
                    onMouseEnter={() => day && setTooltip({ date: day.date, count: day.count })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 text-xs text-gray-400">
          <span className="text-white font-medium">{tooltip.count} activities</span> on {tooltip.date}
        </div>
      )}
    </Card>
  );
};

export default ActivityHeatmap;
