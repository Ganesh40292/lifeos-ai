import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { dashboardService } from '@/services/dashboardService';
import { GraduationCap, Wallet, HeartPulse, Zap } from 'lucide-react';

const CATEGORIES = [
  { key: 'academic', label: 'Academic', icon: GraduationCap, color: '#3b82f6', max: 25 },
  { key: 'finance', label: 'Finance', icon: Wallet, color: '#22c55e', max: 25 },
  { key: 'health', label: 'Health', icon: HeartPulse, color: '#ef4444', max: 25 },
  { key: 'productivity', label: 'Productivity', icon: Zap, color: '#f59e0b', max: 25 },
];

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Getting Started';
};

const LifeScoreGauge = () => {
  const [scoreData, setScoreData] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await dashboardService.getLifeScore();
        setScoreData(result);
      } catch (err) {
        setScoreData({ totalScore: 0, academic: 0, finance: 0, health: 0, productivity: 0 });
      }
    };
    fetch();
  }, []);

  // Animate counter
  useEffect(() => {
    if (!scoreData) return;
    const target = scoreData.totalScore;
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedScore(Math.round(current));
    }, 25);
    return () => clearInterval(timer);
  }, [scoreData]);

  if (!scoreData) return null;

  const score = scoreData.totalScore;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG arc calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <Card title="Life Score" hover>
      <div className="flex flex-col items-center py-4">
        {/* Radial Gauge */}
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="12"
            />
            {/* Score arc */}
            <motion.circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>{animatedScore}</span>
            <span className="text-xs text-gray-400 mt-1">{label}</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="w-full mt-6 space-y-3">
          {CATEGORIES.map((cat) => {
            const value = scoreData[cat.key] || 0;
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{cat.label}</span>
                    <span className="text-xs font-semibold" style={{ color: cat.color }}>{value}/{cat.max}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / cat.max) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default LifeScoreGauge;
