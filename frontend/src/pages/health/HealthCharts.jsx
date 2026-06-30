import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const HealthCharts = ({ metrics }) => {
  const chartData = useMemo(() => {
    return [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [metrics]);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center text-gray-500 py-12">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No health metrics logged yet.</p>
        <p className="text-sm">Start tracking to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight & Sleep Chart */}
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
        <h3 className="text-lg font-medium text-white mb-4">Weight & Sleep Tracking</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${value}kg`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                name="Weight (kg)"
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#1F2937', stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="sleepHours" 
                name="Sleep (hrs)"
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#1F2937', stroke: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Intake Chart */}
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
        <h3 className="text-lg font-medium text-white mb-4">Water Intake (Glasses)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#374151' }}
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
              />
              <Bar 
                dataKey="waterIntakeGlasses" 
                name="Water (glasses)"
                fill="#0EA5E9" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthCharts;
