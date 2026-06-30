import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card from '@/components/ui/Card';

const productivityData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 80 },
  { name: 'Wed', score: 75 },
  { name: 'Thu', score: 90 },
  { name: 'Fri', score: 55 },
  { name: 'Sat', score: 95 },
  { name: 'Sun', score: 85 },
];

const customTooltipStyle = {
  contentStyle: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderRadius: '8px',
    color: '#fafafa',
    fontSize: '12px',
  },
  itemStyle: {
    color: '#a1a1aa',
  },
  labelStyle: {
    fontWeight: 'bold',
    color: '#fafafa',
  },
};

const DashboardCharts = ({ expenseChartData, studyChartData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {/* Monthly Expenses Chart */}
      <Card title="Monthly Expenses" hover>
        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expenseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip {...customTooltipStyle} formatter={(value) => [`₹${value.toFixed(0)}`, 'Expense']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Study Hours Chart */}
      <Card title="Study Hours" hover>
        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studyChartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip {...customTooltipStyle} formatter={(value) => [`${value} hrs`, 'Study Time']} />
              <Bar
                dataKey="value"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weekly Productivity Chart */}
      <Card title="Weekly Productivity Score" hover>
        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip {...customTooltipStyle} formatter={(value) => [`${value}%`, 'Score']} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ stroke: '#7c3aed', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
