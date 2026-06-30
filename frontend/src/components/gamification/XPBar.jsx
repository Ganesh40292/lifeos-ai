import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const XPBar = ({ user }) => {
  if (!user) return null;

  const xp = user.xp || 0;
  const level = user.level || 1;
  const streak = user.streakDays || 0;
  const xpNeeded = level * 100;
  const pct = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <div id="xp-bar-container" className="flex items-center gap-4 bg-gray-950/40 px-3.5 py-1.5 rounded-xl border border-gray-800/80 shadow-inner">
      {/* Level Badge */}
      <div className="flex items-center gap-1">
        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-[11px] font-bold text-gray-300">Lv.{level}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-24 sm:w-32 flex flex-col gap-1">
        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
          <span>{xp} XP</span>
          <span>{xpNeeded} XP</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden w-full relative">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak Counter */}
      {streak > 0 && (
        <div className="flex items-center gap-0.5 text-amber-500 animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span className="text-[11px] font-bold font-mono">{streak}d</span>
        </div>
      )}
    </div>
  );
};

export default XPBar;
